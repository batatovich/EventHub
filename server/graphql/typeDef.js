const typeDefs = `#graphql
  type Query {
    myEvents: [Event!]!
  }

  type Event {
    id: ID!
    name: String!
    description: String!
    location: String!
    date: DateTime!
    capacity: Int!
    fee: Float!
  }

  scalar DateTime
`;

module.exports = typeDefs;