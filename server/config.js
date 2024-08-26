const os = require('os');
require('dotenv').config();

const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
const SERVER_PORT = process.env.SERVER_PORT || 3001;

const config = {
    SERVER_PORT: SERVER_PORT,
    CLIENT_PORT: CLIENT_PORT,
    CORS_ORIGIN: [
        `http://127.0.0.1:${CLIENT_PORT}`,
        `http://localhost:${CLIENT_PORT}`,
        process.env.VERCEL_URL || 'https://event-hub-livid.vercel.app', 
    ],
    CORS_OPTIONS: {
        origin: function (origin, callback) {
            if (config.CORS_ORIGIN.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
    SHOULD_FORK: process.env.SHOULD_FORK === 'true', 
    MAX_FORKS: parseInt(process.env.MAX_FORKS, 10) || Math.min(4, os.cpus().length), 
};

module.exports = config;
