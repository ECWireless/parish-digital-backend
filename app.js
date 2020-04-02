const express = require('express');
const bodyParser = require('body-parser');

const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const { buildSchema } = require('graphql')

// Initialize Port and App
let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

const app = express();

// JSON Parser
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
})

// Attach GraphQL
app.use('/', graphqlHttp({
    schema: buildSchema(`
        type UserInput {
            password: String!
        }

        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }

        type RootQuery {
            login(password: String!): AuthData!
        }

        schema {
            query: RootQuery
        }
    `),
    rootValue: {

    },
    graphiql: true,
}));

app.get('/', (req, res) => res.send('Parish Digital backend'));

app.listen(port, () => console.log(`App listening on port ${port}`))