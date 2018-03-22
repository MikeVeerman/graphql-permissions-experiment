# graphql-permissions-experiment
A basic setup with GraphQL and permission using Apollo.

## Background
This service returns a set of articles. Some of them are public, some of them are for members only.

To authenticate as a member, you'll have to supply a secret HTTP header.

## Setting up
Run `npm install` to install the dependencies

Run `node index.js`to start the server

Browse to `http://localhost:3000/graphiql` to see the GraphiQL interface

## Authorization
For every HTTP request, we will check if the `credentials` header is set to `IAmAMember`. If that is the case, the role `MEMBER` is put on the context. Otherwise, the role `PUBLIC` is assigned. 

Based on that the "external" source will return articles.

## Resolver function signature
Every resolver method gets 4 variables :
* the parent or root
* the parameters
* the context
* the info

See : https://www.apollographql.com/docs/graphql-tools/resolvers.html#Resolver-function-signature

Here we will mainly use the context to share the role with every other resolver.

## Nested resolvers
Check out the bodyLength field on the Article. It has a nested resolver. It looks like we're passing the parent article to this function. That is because we are only using the first of the 4 parameters. It allows a resolver to access the properties of its parent.






