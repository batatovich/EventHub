const cluster = require('cluster');
const setupServer = require('./setup-server');
const config = require('./config');
const prisma = require('./prisma-client');
const authenticate = require('./services/authMiddleware');
const createApolloServer = require('./apollo-server');
const gracefulShutdown = require('./services/shutdown-server');

if (config.SHOULD_FORK && cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < config.MAX_FORKS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, forking a new worker`);
    cluster.fork();
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
        authenticate,           // Inject authentication middleware
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