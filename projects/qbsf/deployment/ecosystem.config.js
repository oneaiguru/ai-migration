module.exports = {
  apps: [{
    name: "sf-qb-integration",
    script: "src/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};
