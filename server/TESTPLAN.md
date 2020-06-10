# Server-Side Test Plan

This document covers the test plan for the server-side implementation of the "collaborative document sharing with undo" project.  Test files may be found under the `app/test` directory of this project.

## Prerequisites and running

In order to run the test cases, make sure that:

- You have `npm` installed

- You are able to run the project (please see the `README.md` file located in this directory)

- You execute the `start` command by running `npm run start` from this directory

- To run the test cases, please execute this command from this directory: `npm run test`

- To Debug test cases, please execute this command from this directory: `npm run test:debug app/test/<testname>`. Please be sure to initiate your debugger process before starting the run. For VSCode, you'll need this entry in your `.vscode/launch.json` file:

```
{
			"name": "serve",
			"port": 9229,
			"protocol": "inspector",
			"request": "attach",
			"restart": true,
			"smartStep": false,
			"sourceMaps": true,
			"timeout": 60000,
			"type": "node",
			"skipFiles": [
				"<node_internals>/**",
				"${workspaceFolder}/node_modules/**/*.js",
				"${workspaceFolder}/serve/node_modules/**/*.js"
			]
		}
```

## Test cases

Test cases are broken down to 'per-mutation' and 'per-subscription', with combinations of the two at the end.

### `updateDocument` mutation test cases

The mutation signature for createDocument is as follows:

```
updateDocument(data: DocumentInput!): LedgerEntry!
```

With the `DocumentInput` type being defined as:

```
input DocumentInput {
  id: ID!
  name: String!
  ownerId: String!
  timestamp: String
  data: PlaybackDataInput!
}
```

and `PlaybackDataInput` defined as:
```
input PlaybackDataInput {
  ownerId: String!
  charStart: Int!
  updateLength: Int
  data: String
  action: DocumentAction!
}
```
The valid `DocumentAction` enums are as follows:
```
enum DocumentAction {
  CREATE
  ADD
  DELETE
}
```

Please note: one of the primary advantages to using graphQL and a strongly-typed schema is that the simple test cases (e.g. parameters marked as required - `!` - are missing) are not explicitly needed. The graphQL client will automatically prevent a call to the service in these cases.

Test cases that **are** needed are cases that test the internal logic of the serice's implementation. These are as follows:

- Attempting to create a document with a unique `DocumentInput.name` and a `DocumentInput.data.action`=`ADD`: **FAIL**

- Attempting to create a document with a unique `DocumentInput.name` and a `DocumentInput.data.action`=`DELETE`: **FAIL**

- Attempting to create a document with a *non*-unique `DocumentInput.name` and a `DocumentInput.data.action`=`CREATE`: **FAIL**

- Attempting to create a document with a *non*-unique `DocumentInput.name` and a `DocumentInput.data.action`=`ADD`: **FAIL**

- Attempting to create a document with a *non*-unique `DocumentInput.name` and a `DocumentInput.data.action`=`DELETE`: **FAIL**

- Attempting to create a document with a unique `DocumentInput.name` and a `DocumentInput.data.action`=`CREATE`: **PASS** **PUBLISH**

- Attempting to create a document with a unique `DocumentInput.name`, a `DocumentInput.data.action`=`CREATE`, and `DocumentInput.data.data`=`Test`: **PASS** **PUBLISH** **VALUE OF "Test" PERSISTS**

- Any localized data / non-latin character testing will not be performed for this project

- Pub/Sub will have a separate section in this test plan
