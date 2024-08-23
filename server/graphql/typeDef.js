const typeDefs = `#graphql
  type Query {
    myEvents: [Event!]!
  }

  type Mutation {
    createEvent(name: String!, description: String!, location: String!, date: DateTime!, capacity: Int!, fee: Float!): Event
    deleteEvent(id: ID!): Boolean
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