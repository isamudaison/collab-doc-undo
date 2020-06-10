import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import express from "express";
import { execute, subscribe } from "graphql";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { DocumentResolver } from "./resolver/document";
import { buildSchema } from "type-graphql";

const main = async () => {

const schema = await buildSchema({
    resolvers: [DocumentResolver],
    emitSchemaFile: true,
    validate: false    
  });

const app = express();
const port = 3333;
const apolloServer = new ApolloServer({
	cacheControl: true,
	context: {},
	debug: true,
	introspection: true,
	playground: true,
	rootValue: {},
	schema,
	subscriptions: {
		onConnect: connectionParams => connectionParams,
		path: "/subscriptions"
	},
	tracing: true
});
const server = createServer(app);

app.use(bodyParser.json({ limit: "1mb" }));

apolloServer.applyMiddleware({ app, cors: true, path: "/graphql" });

	app.use(
		["/", "!/graphql"],
		createProxyMiddleware({
			target: "http://localhost:3333",
			ws: true
		})
	);

server.listen({ host: "0.0.0.0", port }, () => {
	console.info(`
Doc-collab serving:
	GraphQL Playground - http://localhost:${port}${apolloServer.graphqlPath}
	Websocket Subscriptions - ws://localhost:${port}${apolloServer.subscriptionsPath}
	`);

	return new SubscriptionServer(
		{
			execute,
			schema,
			subscribe
		},
		{
			path: apolloServer.subscriptionsPath,
			server
		}
	);
});
};

main().catch((error)=>{
    console.log(error, 'error');
})