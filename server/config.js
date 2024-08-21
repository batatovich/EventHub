const os = require('os');
const CLIENT_PORT = 3000;
const config = {
    SERVER_PORT: process.env.PORT || 3001,
    CLIENT_PORT: CLIENT_PORT,
    CORS_ORIGIN: [
        `http://127.0.0.1:${CLIENT_PORT}`,
        `http://localhost:${CLIENT_PORT}`,
        'https://your-app.vercel.app',      // Replace with vercel domain
    ],
    SHOULD_FORK: true, 
    MAX_FORKS: Math.min(4, os.cpus().length), 
};

module.exports = config;
