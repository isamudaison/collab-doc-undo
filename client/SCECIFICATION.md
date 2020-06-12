# Client-Side Collaborative Document Application

The client side application is a simple react-based js client. It's sole job is to select documents, create documents, and collaboratively edit docuements using the `/server` component based on graphQL.

## Objectives

Create a simple javascript+react-based UI that allows document editing with other clients real-time, including these features:

- A seelctable Document list of available documents to edit

- A text area with simple text manipulation (does not include text styling)

- An 'undo' button that 'un-does' the last action taken on the currently loaded Document

## Non-Objectives

This client-side application is not attempting to solve the following:

- User authN/authZ

- Fancy CSS styling

- 'Explicit' mobile compatibility

## DocumentList Component

The `DocumentList` component has two primary jobs: create a new Document and load existing documents on load, and allow the user to select existing document that may appear in the list.

### DocumentList actions

|Event Name|Data Expected|Action Taken|
|-|-|-|
|onLoad()|`this.state`|Three actions are taken here: First, we issue a GQL mutation of `updateDocument` with the `DocumentAction.CREATE` ActionData. This results in a locally-created `DocumentListItem` entry to be added to the "top" of the list. Second, the query `loadDocuments()` is called. The resulting `Document` data (id any) is taken and parsed such that each `Document` entry creates a new `DocumentListItem` in the list, with `DocumentListItem.label=Document.name` and `DocumentListItem.value=Document.id`. |
|onClick(target)|`target` is the `DocumentListItem` value that was clicked on|The `target` is notified of the `onClick` event, and responsibility is handed off to the appropriate `DocumentListItem` component.|

The `DocumentList` component is fairly simple and doens't do a whole lot. Delegation is mainly passed off to the `DocumentListItem` components. The `DocumentList` does listen for one pub/sub event.

### DocumentList subscriptions

|Subscription Name|Expected Payload|Action taken|
|-|-|-|
|`DOC_CREATE`|`DocumentUpdateNotificationPayload`, containing a `DocumentUpdateNotification` object|Upon recieving this message, the `DocumentList` first must check if the `DocumentUpdateNotification.ownerId == my.id`. If they are not equal, the `DocumentUpdateNotification.name` and `DocumentUpdateNotification.documentId` are used to create a new `DocumentListItem.label` and `DocumentListItem.value`, respectively.|
