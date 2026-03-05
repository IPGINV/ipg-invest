/**
 * CENTRALIZED API CLIENT
 * Единый клиент для всех API запросов из фронтенд приложений
 * Автоматически добавляет JWT токен, обрабатывает ошибки, automatic refresh
 */

type ApiConfig = {
  baseUrl?: string;
  timeout?: number;
};

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  skipAuth?: boolean;
  skipRetry?: boolean;
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || this.getDefaultBaseUrl();
    this.timeout = config.timeout || 30000;
  }

  private getDefaultBaseUrl(): string {
    const isLocal = window.location.hostname === 'localhost';
    return isLocal ? 'http://localhost:3005' : 'https://api.ipg-invest.ae';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('ipg_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('ipg_refresh_token');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('ipg_token', token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('ipg_refresh_token', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('ipg_token');
    localStorage.removeItem('ipg_refresh_token');
    localStorage.removeItem('ipg_user_id');
  }

  /**
   * Автоматический refresh access token
   * Использует refresh token для получения нового access token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401);
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Refresh token failed',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      
      // Сохраняем новые токены
      this.setAuthToken(data.accessToken);
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return data.accessToken;
    } catch (error) {
      // Если refresh не удался - очищаем все и редирект на login
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Управление очередью запросов во время refresh
   * Все запросы, которые пришли во время refresh, ждут его завершения
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Автоматически добавляем JWT токен
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Добавляем query параметры
    const urlWithParams = options.params
      ? `${url}?${new URLSearchParams(options.params)}`
      : url;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(urlWithParams, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Обработка ошибок
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // AUTOMATIC REFRESH LOGIC
        if (
          response.status === 401 && 
          errorData.error === 'TokenExpired' &&
          !options.skipRetry &&
          !options.skipAuth
        ) {
          // Если уже идет refresh - ждем его завершения
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.addRefreshSubscriber(async (newToken: string) => {
                try {
                  // Повторяем оригинальный запрос с новым токеном
                  const result = await this.request<T>(
                    method, 
                    endpoint, 
                    data, 
                    { ...options, skipRetry: true }
                  );
                  resolve(result);
                } catch (err) {
                  reject(err);
                }
              });
            });
          }

          // Начинаем refresh
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);

            // Повторяем оригинальный запрос с новым токеном
            return await this.request<T>(
              method, 
              endpoint, 
              data, 
              { ...options, skipRetry: true }
            );
          } catch (refreshError) {
            this.isRefreshing = false;
            this.onRefreshed(''); // Уведомляем ожидающие запросы об ошибке
            
            // Редирект на login
            if (window.location.pathname !== '/login.html') {
              window.location.href = '/login.html';
            }
            throw new ApiError('Session expired, please login again', 401);
          }
        }

        throw new ApiError(
          errorData.message || errorData.error || 'Request failed',
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      throw new ApiError('Network error', 0, error);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // === AUTH ENDPOINTS ===
  
  async login(login: string, password: string) {
    const result = await this.post<{
      tokens: { accessToken: string; refreshToken: string };
      user: { id: number; investor_id: string; email: string; full_name: string };
    }>('/auth/login', { login, password }, { skipAuth: true });

    // Автоматически сохраняем токены
    if (result.tokens) {
      this.setAuthToken(result.tokens.accessToken);
      this.setRefreshToken(result.tokens.refreshToken);
      localStorage.setItem('ipg_user_id', String(result.user.id));
    }

    return result;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    
    try {
      await this.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Игнорируем ошибки logout
      console.warn('Logout error:', error);
    } finally {
      // Всегда очищаем локальные токены
      this.clearTokens();
    }
  }

  async manualRefresh() {
    try {
      const newToken = await this.refreshAccessToken();
      return { success: true, accessToken: newToken };
    } catch (error) {
      return { success: false, error };
    }
  }

  async registerEmail(data: {
    email: string;
    password: string;
    full_name: string;
    agree_terms: boolean;
  }) {
    return this.post('/auth/register/email', data, { skipAuth: true });
  }

  // === UNIFIED ENDPOINTS (оптимизированные) ===
  
  async getUserDashboard(userId: string, transactionsLimit = 50) {
    return this.get<{
      user: any;
      balances: any[];
      contracts: any[];
      transactions: any[];
      meta: { timestamp: string; transactionsLimit: number };
    }>(`/unified/user-dashboard/${userId}`, {
      params: { transactionsLimit: String(transactionsLimit) }
    });
  }

  async getBatchUsers(userIds: number[]) {
    return this.post<{
      users: any[];
      meta: { count: number; requested: number };
    }>('/unified/batch-users', { userIds });
  }

  async getStatistics() {
    return this.get<{
      total_users: number;
      active_users: number;
      pending_users: number;
      new_users_week: number;
      active_today: number;
      total_usd: number;
      total_ghs: number;
      total_contracts: number;
      total_invested: number;
    }>('/unified/statistics');
  }

  // === USER ENDPOINTS ===
  
  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    return this.post(`/users/${id}/password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  // === PUBLIC API ENDPOINTS ===
  
  async getMarketData() {
    return this.get<{
      goldPrice: number;
      yearlyGrowth: number;
      currencyRates: { AED: number; RUB: number };
      timestamp: string;
    }>('/api/market-data', { skipAuth: true });
  }

  async calculateInvestment(data: {
    initialInvestment: number;
    cycles: number;
    reinvestmentEnabled: boolean;
    reinvestmentPercentage: number;
  }) {
    return this.post('/api/investments/calculate', data, { skipAuth: true });
  }

  // === BALANCES ===
  
  async getBalances(userId: string) {
    return this.get(`/balances`, { params: { userId } });
  }

  // === TRANSACTIONS ===
  
  async getTransactions(userId: string, limit = 100) {
    return this.get(`/transactions`, { params: { userId, limit: String(limit) } });
  }

  // === CONTRACTS ===
  
  async getContracts(userId: string, limit = 100) {
    return this.get(`/contracts`, { params: { userId, limit: String(limit) } });
  }
}

// Custom Error Class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton instance
const apiClient = new ApiClient();

export { apiClient, ApiClient, ApiError };
export default apiClient;
