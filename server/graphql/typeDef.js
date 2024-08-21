const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    signUp(email: String!, password: String!): User
    signIn(email: String!, password: String!): String! # Returns a JWT token
  }
`;

module.exports = typeDefs;