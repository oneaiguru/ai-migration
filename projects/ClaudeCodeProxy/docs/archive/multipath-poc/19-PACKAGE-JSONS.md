```json
// package.json (root, combine all POCs)
{
  "name": "haiku-to-glm-poc",
  "private": true,
  "type": "module",
  "scripts": {
    "gateway": "node poc/gateway-haiku-router.js",
    "broker": "node poc/dual-cli-router.js",
    "pty": "node poc/pty-wrapper.js",
    "watch": "node poc/trace-watcher.js"
  },
  "dependencies": {
    "chokidar": "^3.6.0",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "http-proxy-middleware": "^3.0.1",
    "morgan": "^1.10.0",
    "node-pty": "^1.0.0"
  }
}
```

---