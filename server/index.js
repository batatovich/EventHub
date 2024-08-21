const setupServer = require('./express-server');
const prisma = require('./prisma-client'); 

async function main() {
  try {

    // Singleton app instance
    const app = await setupServer(); 

    // Ensure prisma connection
    await prisma.$connect();
    console.log('Prisma connected successfully.');

    // Start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running, listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error during app initialization:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('App initialized successfully');
  })
  .catch((error) => {
    console.error('App initialization failed:', error);
  });
