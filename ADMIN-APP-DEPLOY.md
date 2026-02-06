# Admin App на сервере

## Где располагается

**Admin App** на production сервере доступен по поддомену:

| Окружение | URL | Порт (внутренний) |
|-----------|-----|-------------------|
| **Production** | **https://admin.ipg-invest.ae** | 3004 → 80 (контейнер) |
| Локальная разработка | http://localhost:3000 | 3000 |

---

## Что сделано для деплоя

1. **Docker:** добавлен сервис `admin` в `docker-compose.yml` (порт **3004:80**).
2. **Nginx:** в пошаговой инструкции и в `nginx/conf.d/ipg-invest.ae.conf` добавлен виртуальный хост для `admin.ipg-invest.ae` (проксирование на `127.0.0.1:3004` или контейнер `admin`).
3. **CORS:** в `server/.env.production` в `CORS_ORIGIN` добавлен `https://admin.ipg-invest.ae`.
4. **Admin App:** в `admin/App.tsx` для production заданы:
   - API: `https://api.ipg-invest.ae`
   - Ссылки на приложения: поддомены (dashboard.ipg-invest.ae, wallet.ipg-invest.ae и т.д.).
5. **Сборка:** добавлены `admin/Dockerfile` и `admin/nginx.conf` для сборки и отдачи статики в контейнере.

---

## DNS

В панели управления доменом добавьте A-запись:

| Имя (Host) | Тип | Значение   | TTL |
|------------|-----|------------|-----|
| admin      | A   | IP_СЕРВЕРА | 300 |

---

## SSL

При получении сертификатов добавьте домен Admin:

```bash
sudo certbot --nginx -d admin.ipg-invest.ae
```

или в общую команду с остальными доменами (как в `DEPLOY-STEPS-NOW.md`).

---

## Запуск контейнеров с Admin

При деплое **без** контейнера Nginx (Nginx на хосте):

```bash
docker compose up -d postgres redis api dashboard lending info wallet admin
```

При полном запуске через Docker Compose Admin поднимается вместе с остальными сервисами.

---

## Доступ

- **Production:** https://admin.ipg-invest.ae  
- **Локально:** http://localhost:3000 (или порт из `admin/vite.config.ts`)

Доступ к админ-панели рекомендуется ограничить по IP или защитить отдельной авторизацией на уровне Nginx/приложения.
