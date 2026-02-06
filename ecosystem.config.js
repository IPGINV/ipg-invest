// PM2 Ecosystem File for IPG Project
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'ipg-api',
      cwd: './server',
      script: 'index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/ipg-api-error.log',
      out_file: '/var/log/pm2/ipg-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'ipg-telegram-bot',
      cwd: './server',
      script: 'telegram-bot.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/ipg-bot-error.log',
      out_file: '/var/log/pm2/ipg-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
