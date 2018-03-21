const { find, filter } = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

// Het GraphQL schema in String formaat
const typeDefs = `
  type Query { articles: [Article] }
  type Article { title: String, body: String }
`;

// De resolvers
const resolvers = {
  Query: { 
      articles: (_root, _params, ctx ) => retrieveTheArticles(ctx)
    }
}

//Hier halen we de gegevens op uit een "externe" bron
//In dit geval zal de de bron checken of de gebruiker al dan niet toegang heeft
const retrieveTheArticles = function (ctx){
    const articles = [
        {
            title: "Nieuwe regeling woonbonus",
            body: "Vanaf 2016 tellen er nieuwe regels voor de woonbonus.",
            permission: "everyone"
        },
        {
            title: "Werken als 50-plusser",
            body: "Elke werkzoekende boven de 50 krijgt extra ondersteuning van VDAB.",
            permission: "everyone"
        },
        {
            title: "Nieuwe deotologische code notarissen",
            body: "Op 1 januari wordt de nieuwe deontologische code voor notarissen van kracht.",
            permission: "notaris"
        }
    
    ]

    //Permissie systeem aan de kant van de bron.
    const role = ctx.user.role;
    if (role === 'PUBLIC') {
        return filter(articles, {permission:'everyone'});
    } else if (role === 'NOTARIS'){
        return articles;
    } 
}

// We bouwen het schema uit de types en de resolvers
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

//Hier lezen we de request headers en zetten we de rollen op de context.
//In de praktijk zal dit hier met een aparte "RBAC" module verbinden
//Dit kan op basis van HTTP headers, JWT, OpenId, OAuth, ...
const getUserFromRequest = function(req) {
    const role = (req.get('credentials') === 'IkBenEenNotaris') ? 'NOTARIS' : 'PUBLIC'
    return {role: role}
}

// Start de server
const app = express();

// Voeg de GraphQL middleware toe en zorg ervoor dat bij elke request de
//context gezet wordt.
app.use('/graphql', bodyParser.json(), graphqlExpress(req => {

    const context = {
        user: getUserFromRequest(req)
    }
    return {schema, context}
}));

// Activeer GraphiQL
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start de server
app.listen(3000, () => {
  console.log('Ga naar http://localhost:3000/graphiql !');
});