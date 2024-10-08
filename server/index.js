require('dotenv').config();
const cluster = require('cluster');
const config = require('./config');
const prisma = require('./prisma-client');
const setupServer = require('./express-server');
const createApolloServer = require('./apollo-server');
const authMiddleware = require('./services/authMiddleware');
const gracefulShutdown = require('./services/shutdown-server');


if (config.SHOULD_FORK && cluster.isMaster) {
  for (let i = 0; i < config.MAX_FORKS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (code !== 0) {
      console.error(`Worker ${worker.process.pid} exited with error code ${code}`);
    } else if (signal) {
      console.log(`Worker ${worker.process.pid} was killed by signal ${signal}`);
    } else {
      console.log(`Worker ${worker.process.pid} exited successfully.`);
    }

    console.log(`Forking a new worker...`);
    cluster.fork(); // Replace the dead worker with a new one
  });

} else {
  // Worker processes
  async function main() {
    try {
      // Ensure Prisma connection
      await prisma.$connect();
      console.log(`Prisma connected successfully in worker ${process.pid}`);

      // Set up the server with dependency injection
      const app = await setupServer({
        prisma,                 // Inject Prisma client
        authMiddleware,           // Inject authentication middleware
        createApolloServer      // Inject Apollo server creation function
      });

      // Start the server
      const server = app.listen(config.SERVER_PORT, () => {
        console.log(`Worker ${process.pid} is running, listening on port ${config.SERVER_PORT}`);
      });

      // Attach graceful shutdown
      process.on('SIGTERM', () => gracefulShutdown({ server, prisma, signal: 'SIGTERM' }));
      process.on('SIGINT', () => gracefulShutdown({ server, prisma, signal: 'SIGINT' }));

    } catch (error) {
      console.error(`Error during worker ${process.pid} initialization:`, error);
      process.exit(1);
    }
  }

  main()
    .then(() => {
      console.log(`Worker ${process.pid} initialized successfully`);
    })
    .catch((error) => {
      console.error(`Worker ${process.pid} initialization failed:`, error);
    });
}