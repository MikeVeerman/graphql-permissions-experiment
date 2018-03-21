const { find } = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

// Some fake data
const authors = [
  {
    id: 1,
    name: 'J.K. Rowling',
  },
  {
    id: 2,
    name: 'Michael Crichton',
  },
  {
    id: 3,
    name: 'Dan Brown'
  }
];

const articles = [
    {
        title: "How I made my first million",
        body: "People never grow up, so market a childrens book to adults.",
        authorId: 1
    },
    {
        title: "My childhood hobby",
        body: "I was into dinosaurs and aliens as a boy.",
        authorId: 2
    },
    {
        title: "Why people buy my books",
        body: "Mainly because of Tom Hanks.",
        authorId: 3
    }

]

// The GraphQL schema in string form
const typeDefs = `
  type Query { articles: [Article] }
  type Article { title: String, body: String, author: Author }
  type Author { id: Int, name: String }
`;

// The resolvers
const resolvers = {
  Query: { 
      articles: () => articles
    },
  Article: { 
      author: (article) => find(authors, {id: article.authorId})
    }
}

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});