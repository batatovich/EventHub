const typeDefs = `#graphql
  type Query {
    myEvents: [Event!]!
    othersEvents: [Event!]! 
  }

  type Mutation {
    createEvent(name: String!, description: String!, location: String!, date: DateTime!, capacity: Int!, fee: Float!): Event
    deleteEvent(id: ID!): Boolean
    applyToEvent(eventId: ID!): Application!  
    cancelApplication(eventId: ID!): Boolean! 
  }

  type Event {
    id: ID!
    name: String!
    description: String!
    location: String!
    date: DateTime!
    capacity: Int!
    fee: Float!
    applicationStatus: [Application] 
  }

  type Application {
    id: ID!
    status: String!
    eventId: String!
    userId: String!
  }

  scalar DateTime
`;

module.exports = typeDefs;