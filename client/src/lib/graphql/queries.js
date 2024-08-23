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
