import { gql } from '@apollo/client';

export const GET_MY_EVENTS = gql`
  query GetMyEvents {
    myEvents {
      id
      name
      description
      location
      date
      capacity
      fee
    }
  }
`;

export const GET_OTHERS_EVENTS = gql`
  query GetOthersEvents {
    othersEvents {
      id
      name
      description
      location
      date
      capacity
      fee
      applicationStatus {
        status
      }
    }
  }
`;

export const GET_EVENT_APPLICATIONS = gql`
  query GET_EVENT_APPLICATIONS($eventId: ID!) {
    eventApplications(eventId: $eventId) {
      id
      user {
        email
      }
      status
    }
  }
`;