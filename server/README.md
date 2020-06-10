# Typescript/GQL Server Info

### Cloning/copying

Clone/fork/steal this project.  Note: Both this `server` directory and `client` directory should be able to work independently (or build, at least) of each other.

### Building

- Ensure `npm` is installed (note: `npx` has not been tested with this project).
- Make sure you're in the root directory (e.g. `path/to/collaborative-document-undo-fwtunk/server`) and run the command: `npm install`.
- In that same directory, issue the command: `npm run build-ts`.

### Running / Debugging

While still in the same `/server` directory, run: `npm run start`.

You should get a message like this on a successful run:

```🚀 Server ready and listening at ==> http://localhost:3333/graphql```

You will be able to access the GQL Playground interface by navigating to `http://localhost:3333/graphql`

To be able to debug, make sure to stop the server if you've already issued the `start` command, and issue a `npm run debug` command.  This will start listening to the proper port.  You may then attach to the debugger.  In VSCode, be sure this entry is in your `.vscode/launch.json` file:

```{
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
		}```