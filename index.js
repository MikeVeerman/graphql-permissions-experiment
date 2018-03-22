const { find, filter } = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

// The GraphQL schema as a String
const typeDefs = `
  type Query { articles: [Article] }
  type Article { title: String, body: String }
`;

// The resolvers
const resolvers = {
  Query: { 
      articles: (_root, _params, ctx ) => retrieveTheArticles(ctx)
    }
}

//Here we retrieve the data from the "external" source
//This source checks if we're allowed to access the members-only articles
//based on the context
const retrieveTheArticles = function (ctx){
    const articles = [
        {
            title: "Some amazing article.",
            body: "You've seen a lot of articles, but this is really something else.",
            permission: "everyone"
        },
        {
            title: "Extremely average article.",
            body: "There is nothing remarkable about this, but at least it's free.",
            permission: "everyone"
        },
        {
            title: "New passwords for the members",
            body: "The new password for the club house is 'Excalibur'. Don't tell the plebeians....",
            permission: "members"
        }
    
    ]

    //Permission system.
    if (ctx.role === 'PUBLIC') {
        return filter(articles, {permission:'everyone'});
    } else if (ctx.role === 'MEMBER'){
        return articles;
    } 
}

// makeExecutableSchema turns the GraphQL schema and the resolvers into 
// an active component.
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

//Here we read the HTTP request and do some authentication.
//If there is a 'credentials' header with the code 'IAmAMember', you're entitled
//to some extra articles.
//This returns the role.
const getRoleFromRequest = function(req) {
    return (req.get('credentials') === 'IAmAMember') ? 'MEMBER' : 'PUBLIC'
}

// Start the server
const app = express();

// Add the GraphQL-Express middleware and make sure we add the role to the "context" variable
// This context will be passed to every resolver.
app.use('/graphql', bodyParser.json(), graphqlExpress(req => {
    const context = {
        role: getRoleFromRequest(req)
    }
    return {schema, context}
}));

// Activate GraphiQL
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql !');
});