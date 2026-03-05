const { createClient } = require('redis');

let client;
let redisAvailable = false;

const getRedis = async () => {
  // Если Redis уже подключен, возвращаем клиент
  if (client && redisAvailable) return client;
  
  // Если Redis URL не указан, возвращаем null (работаем без Redis)
  if (!process.env.REDIS_URL) {
    console.log('[Redis] URL not configured, running without Redis');
    return null;
  }
  
  try {
    if (!client) {
      client = createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
        redisAvailable = false;
      });
      
      await client.connect();
      redisAvailable = true;
      console.log('[Redis] Connected successfully');
    }
    return client;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error.message);
    console.log('[Redis] Running without Redis - rate limiting will use in-memory fallback');
    redisAvailable = false;
    return null;
  }
};

module.exports = { getRedis };
