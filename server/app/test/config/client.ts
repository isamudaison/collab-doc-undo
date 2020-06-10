import ApolloClient from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink }  from "apollo-link-http";
import { WebSocketLink }  from "apollo-link-ws";
import { InMemoryCache } from 'apollo-boost';
import { getMainDefinition } from 'apollo-utilities';


const GQL_PORT:number = 3333;
const GQL_SERVER:string = `http://localhost:${GQL_PORT}/graphql`;
const GQL_WS:string = `ws://localhost:${GQL_PORT}/subscriptions`;


  // Create an http link:
const httpLink = new HttpLink({
    uri: GQL_SERVER
  });
  
  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: GQL_WS,
    options: {
      reconnect: true
    }
  });
  
  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

export const client = new ApolloClient({
    link,cache:new InMemoryCache()
});
