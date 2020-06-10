# Design Document/Assumptions - Collaborative "Undo-able" Client/Server Application

## Objectives

The purpose of this application is to implement a rudimentary client/server combination that allows at least two clients to interactively edit the same "document". Additionally, an 'undo' button should be available, which can 'undo', step-by-step, changes by all users up to the creation of the document.

## Non-Objectives

This application will *not* attempt to do any of the following:

- Be mobile-compatible
- Have a reactive layout (e.g. dynamically re-size)
- Contain UI elements other than a text input and a "undo" button
- Support "re-do"
- Permanently persist neither the document data nor the user contexts for the document changes
- Spellcheck

## Server-Side Assumptions

The server side application for this exercise will implement a pub/sub model, based in typeGraphQL. To minimize the layers of abstraction and have future expand-ability in functionality, no libraries other than the [typegraphQL pub/sub implementation](https://github.com/MichalLytek/type-graphql) will be used for client messaging. This will enable complete control over future improvements in data payloads sent back&forth.

## Generating a New Document

When the client initializes for the first time, a new Document object must be created. To do so, a graphQL mutation call must be made in the following format:

    updateDocument(data:DocumentInput!){result:LedgerEntry}

### Input Detail

|Name     |Value Rules  |
|--           |--|
|data         |This is the DocumentInput object.  The requirement here is that the `data.action` **must** equal `CREATE`. **required**

### Output Detail

|  Name| Value Rules |
|--|--|
|result  | This is the resulting 'initial' `LedgerEntry` object that was generated. The `result.documentId` and `result.ownerId` may be cached on the client-side. |

## Server-side rules for creating a Document

When a new Document is created, we must create an entry in the `DocumentLedger`.  Follow the rules for *Initializing the DocumentLedger* in this scenario. Once the `DocumentLedger` entry has been initialized, a  publish message must be broadcast from the server containing the following data:
`publish(documentCreated({name:String, ownerId:String, data:LedgerEntry, timestamp:String, documentId:String}))`
The client may use this to update it's list of available documents to edit.

### Initializing the DocumentLedger

The `DocumentLedger` is a simple Map data structure that is keyed off of the `documentID`. This structure can be described as follows:
`Map<documentId:String, ledgerEntries:Stack<LedgerEntry>>`
This map may be in-memory for the MVP.  Future revisions should store this object to a high-performance (low latency) persistence layer; A Redis or a Memcached instance is preferable.  The service should keep an L1 cache of any corresponding `documentId` entries that have been accessed in the past 24 hours.

Once the `DocumentLedger` has been initialized, the initial `LedgerEntry` value must be created.

### LedgerEntry Object Definition

|Property Name| DataType  | Special Notes|
|--|--|--|
| ownerId | String **required** |This is the ownerId (which could also be considered a "clientId") of the client that made this specific edit.|
|timestamp|String|This is the `String` value of the `long` timestamp that the edit was made. This is a non-critical property, but will be useful for the future.|
|data|PlaybackData **required**|This is the data *difference* from the previous `LedgerEntry.data` value. If this is the first entry in the corresponding value to the `documentId` in the `DocumentLedger`, then it contains an `Action.CREATE` entry. See the *PlaybackData Details* section for more information.|

Once the first `LedgerEntry` is created, the `Stack<LedgerEntry>` object may be initialized as a standard LIFO Stack data structure.  For this project, [this stack TS module](https://www.npmjs.com/package/stack-typescript) will be used as the implementation. The base `LedgerEntry` object may then be pushed onto the Stack.  One special note about this Stack: It may not be empty once it has been initialized.  The first `LedgerEntry` object must remain, unless the Document gets deleted.

## Loading an Existing Document

To load up an existing document, a simple query can be made against the service:

```
loadDocument(documentId:String!){document:Document}
```

### Input Detail

|Name     |Value Rules  |
|--           |--|
|documentId         |This is the id of the document to load. **required**|

This will return the entirety of the existing document (if available). If no document corresponds to the given documentId, null will be returned.

### Output Detail

|  Name| Value Rules |
|--|--|
|document| This is the resulting `Document` object that was loaded. |

## Server Side Rules for Loading a Document

Loading a document is a straightforward process: we simply retrieve the appropirate `LedgerEntry` Stack and iterate over each object. Generating the document data is simply applying each change in order. Future versions may want to cache the fully-generated document to prevent excessive generation executions.

### Document Object Definition

|Property Name| DataType  | Special Notes|
|--|--|--|
|documentId|String|The ID of the Document|
|ownerId|String|The owner of the Document (e.g. the user the initiated the `DocumentAction.CREATE` `DocumentAction`).|
|body|String/CLOB|The body of the Document. This may be UTF-8 encoded, and may capture inputs such as "/r/n" and "/t" for formatting purposes. TODO: re-visit this for any special format encoding characters|

## Updating an Existing Document

When the client determines a document has been edited, a call to update the Document object using the following mutation:

    updateDocument(data:DocumentInput!){result:LedgerEntry}

### Input Detail

|Name     |Value Rules  |
|--           |--|
|data         |This is the DocumentInput object.  The requirement here is that the `data.action` **must not** equal `CREATE`. **required**|

### Output Detail

|  Name| Value Rules |
|--|--|
|result  | This is the resulting `LedgerEntry` object that was generated. |
If the update *was* successful, a publish message must be broadcast from the server containing the following data:
`publish(documentUpdated({ownerId:String, data:LedgerEntry, timestamp:String}))`

## Server-side rules for storing Document updates

When the above `updateDocument` mutation is triggered, the server side must do the following:

- Check that the `data.id` has an entry in the `DocumentLedger` and the `data.action` != `CREATE`
- If the `documentId` does *not* have an entry,  `updateSuccessful:false` is returned to the client (the `createDocument` call **must** be used to initialize a `Document` properly.
- If the `documentId` ledger entry *does* exist, a new LedgerEntry is created using the **LedgerEntry creation rules** and pushed on the Ledger stack.

Note that in updating the Document, there is a chance for latency to cause out-or-order `LedgerEntry` objects to be created & pushed. Using the timestamp, this may be avoided in future revisions, however this will remain a limitation for the first revision of this project.
Future revisions should also implement a `DocumentUpdateLock`, so that only one edit may be processed at a time.

### PlaybackData Object Defintion

|Name|DataType|Nullable?|Notes|
|-|-|-|-|
|ownerId|String|*no*|Tracks the origin of the Document change.|
|charStart|Integer|*no*|Tracks the start position of the change.|
|updateLength|Integer|*yes*|Tracks how many characters were affected by the change. Optional - default value is `1`.|
|data|String|*no*|The String data that may have been removed/added/inserted.|
|action|DocumentAction (`Enum`)|*no*|Specifies the action that was performed in this LedgerEntry. See *DocumentAction* table for more detail.|

`PlaybackData` objects power the difference engine for Document updates. This object tracks five things: the ownerId that made the update, the character location where the updated started, the size (in characters) of the change, the action that was performed, and optionally any String data that was added.

### DocumentAction Object Defintion

|Value|Text Operation|Notes|
|-|-|-|
|DocumentAction.CREATE|None|No explicit text operation associated; Used for tracking document creation.|
|DocumentAction.ADD|Insert Text|Used in conjuncion with `charStart`, and `data`.|
|DocumentAction.DELETE|Remove Text|Used in conjuction with `charStart`, and `data`. Note in this case, the `data` value contains the deleted text|

DocumentAction is a simple enum that directs the client on what updates to perform given a `DocumentUpdate` notification.

With the above objects, it is possible to track manual text input (regular typing), deleting (regular backspaces), highlighting with either replacement or deletion, and even pasting data into the document.

## Processing Undo Requests

The graphQL service shall support a mutation called `undo`.  The signature is as follows:

```
undo(documentId:String!){result:Boolean}
```

### Input Detail

|Name|Data Type|Notes|
|-|-|-|
|documentId|String **required**|This is the documentId that that undo should be performed on. Note that undo is **cross-user**, therefore any undo action may be performed regardless of which user initiated the previous action.|

### Output Detail

|Name|Data Type|Notes|
|-|-|-|
|result|Boolean|The result of this mutation will be `true` if the undo action was successful, or `false` otherwise. Note that a successful undo will trigger a `DOC_UPDATE` publish message.|

### PubSub Result

If a client has subscribed to `updateDocumentSubscription`, a notification will be sent as the result of the `undo` mutation. This will contain the processed `DocumentUpdateNotification`, and should be treated as normal. All undo logic is processed server-side, relieving clients from having to perform any 'undo logic'.

## Performing Undo Logic in the Service

When an `undo` mutation is requested, the following steps must be performed.

- The service must verify a `DocumentLedger` exists for the given `documentId` value

- The corresponding `DocumentLedger` is then inspected to make sure there are > 1 `LedgerEntries` on the stack; If there are less than 2 entries, no undo may be performed (in this case only the `delete` and `update` mutations are valid calls). If there are > 1 `LedgerEntry` objects on the `DocumentLedger` Stack, the undo may continue

- The topmost entry of the `DocumentLedger` Stack is 'popped' off, and a `PlaybackData` *difference object* must be generated

- A standard "DOC_UPDTE" publish message is sent and clients to behave as normal

### Generating a `PlaybackData` difference object

When an `undo` mutation is called, the service must determine 'how' to perform the undo. This is achieved by inspecting the topmost `LedgerEntry` on the `DocumentLedger` Stack. Recall that a `LedgerEntry` object contains a `PlaybackData` object in it's `LedgerEntry.data` property. Using this object, we generate a difference object using the following rules:

|Action to undo|ADD|DELETE|CREATE|
|-|-|-|-
|Resulting undo action|DELETE|ADD|N/A|
|Generation logic|When creating a `DELETE`-based `PlaybackData` object for undoing, we simply change the action to `DELETE` and use the same charStart, and updateLength, and data values.|When creating an `ADD`-based `PlaybackData` undo object, the action is simply switched to `ADD` while the other vlaues remain the same.|Not a valid action choice|

With the difference `PlaybackAction` generated, we may now pop the `LedgerEntry` that is being "un-done" off the persisted `LedgerEntry` Stack. Persistence should be performed at that point (wether it be in-memory or non-volatile). A failure of persistence should not prevent a "DOC_UPDATE" publish message from being triggered.  For this MVP, since everything will be in-memory this should be a non-issue, however such a state should be addressed with the introduction of non-volatile storage (e.g. redis/memcached/mysql/etc). A "pending update" queue pattern should be used to address that scenario.
