module.exports = {
  apps: [
    {
      name: 'style-villa-client',
      cwd: '/root/style-villa/client',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3005,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/style-villa-client-error.log",
      out_file: "/root/.pm2/logs/style-villa-client-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'style-villa-admin',
      cwd: '/root/style-villa/front',
      script: 'npm',
      args: 'run preview',
      env: {
        PORT: 4177,
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      },
      error_file: "/root/.pm2/logs/style-villa-admin-error.log",
      out_file: "/root/.pm2/logs/style-villa-admin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'style-villa-server',
      cwd: '/root/style-villa/server',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 4006,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/style-villa-server-error.log",
      out_file: "/root/.pm2/logs/style-villa-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
  ]
};