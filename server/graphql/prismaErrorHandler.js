const Prisma = require('@prisma/client'); 
const { GraphQLError } = require('graphql');

function handlePrismaErrors(error) {
  console.log(error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorCode = parseInt(error.code.substring(1), 10);

    if (errorCode >= 2000 && errorCode < 3000) {
      // Handle Prisma 2xxx errors (data validation issues)
      throw new GraphQLError('Validation failed', {
        extensions: {
          code: 'BAD_USER_INPUT',
          validationErrors: error.message, 
        },
      });
    } else if (errorCode >= 1000 && errorCode < 2000) {
      // Handle Prisma 1xxx errors (system errors)
      throw new GraphQLError('Database connection error', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          error: error.message,
        },
      });
    }
  }

  // Handle other unexpected errors
  throw new GraphQLError('An unexpected error occurred', {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      error: error.message,
    },
  });
}

module.exports = { handlePrismaErrors };
