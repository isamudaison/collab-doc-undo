import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import {client} from "./config/client";
// import { DocumentAction } from '../app/type/DocumentAction';

describe('Tests the updateDocument Mutation', () => {
    it('UPDATE/create should succeed if there is no DocumentLedger entry for the given DocumentInput.name', async () => {
          const updateDocument = gql`
            mutation {
              updateDocument(data: 
              { 
                id: "1", 
                name: "test-successful", 
                data: {
                  charStart:0,
                  action:CREATE,
                  ownerId:"1",
                  data:"abs"
                  }, 
                ownerId: "mine" 
              })
              {    
                data{ownerId,action,charStart}  
                }
            }
            `;
      
    const result = await client.mutate({mutation: updateDocument});
    expect(result.data);

  });
  it('ADD should succeed if there is a DocumentLedger entry for the given DocumentInput.name', async () => {
    const updateDocument = gql`
      mutation {
        updateDocument(data: 
        { 
          id: "1", 
          name: "test-successful", 
          data: {
            charStart:3,
            action:ADD,
            ownerId:"1",
            data:"abs"
            }, 
          ownerId: "mine" 
        })
        {    
          data{ownerId,action,charStart}  
          }
      }
      `;

const result = await client.mutate({mutation: updateDocument});
expect(result.data);

})
it("Subscriptions should get triggered on document update", async done => {
  const subscriptionPromise = new Promise((resolve, reject) => {
    client
      .subscribe({
        query: gql`
          subscription updateDocSub {
            updateDocumentSubscription {
              id,name,timestamp,data{charStart,action,updateLength,data}
            }
          }
        `
      })
      .subscribe({
        next: resolve,
        error: reject
      });
  });

  // create a new doc
  const updateDocument = gql`
            mutation {
              updateDocument(data: 
              { 
                id: "2", 
                name: "sub-test-successful", 
                data: {
                  charStart:0,
                  action:CREATE,
                  ownerId:"1",
                  data:"abs"
                  }, 
                ownerId: "mine" 
              })
              {    
                data{ownerId,action,charStart}  
                }
            }
            `;
      
  await client.mutate({mutation: updateDocument});

  const timestamp:string = new Date().toString();


  await client.mutate({
    mutation: gql`
      mutation {
        updateDocument(data: 
        { 
          id: "2", 
          name: "sub-test-successful", 
          data: {
            charStart:3,
            action:ADD,
            ownerId:"1",
            data:"abs"
            }, 
          ownerId: "mine" ,
          timestamp: ""
        })
        {    
          data{ownerId,action,charStart}  
          }
      }
    `,variables:{timestamp}
  });
  expect(await subscriptionPromise).toEqual({
    data: {
      updateDocumentSubscription: {
        __typename:"DocumentUpdateNotification",
        id: "2",
        name: "sub-test-successful",
        timestamp,
        data: {
          __typename:"PlaybackData",
          charStart: 3,
          action: 'ADD',
          updateLength: null,
          data:"abs"
        }
      }
    }
  });
  done();
});
});