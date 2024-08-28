const typeDefs = `#graphql
  type Query {
    myEvents: [Event!]!
    othersEvents: [Event!]! 
    eventApplications(eventId: ID!): [Application]
  }

  type Mutation {
    createEvent(name: String!, description: String!, location: String!, date: DateTime!, capacity: Int!, fee: Float!): Event
    deleteEvent(id: ID!): Boolean
    applyToEvent(eventId: ID!): Application!  
    cancelApplication(eventId: ID!): Boolean! 
    updateApplicationStatus(id: ID!, status: ApplicationStatus!): Boolean!
  }

  type Event {
    id: ID!
    name: String!
    description: String!
    location: String!
    date: DateTime!
    capacity: Int!
    fee: Float!
    applications: [Application]
    applicationStatus: [Application] 
  }

  type Application {
    id: ID!
    status: ApplicationStatus!
    eventId: String!
    user: User!
  }

  type User {
    id: ID!
    email: String!
  }

  enum ApplicationStatus {
    PENDING
    ACCEPTED
    REJECTED
    CANCELED
  }
    
  scalar DateTime
`;

module.exports = typeDefs;