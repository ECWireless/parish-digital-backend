const express = require('express');

const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { buildSchema } = require('graphql');

// Password Encryption and Token
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Port and App
let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

const app = express();

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
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type User {
            _id: ID!
            password: String!
        }
        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }
        input UserInput {
            password: String!
        }

        type RootQuery {
            login(password: String!): AuthData!
        }
        type RootMutation {
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        login: async({ password }) => {
            if (password !== 'secret') {
                throw new Error('Password is incorrect');
            }

            const token = jwt.sign({userId: 1371113, username: "ParishDigital"}, 'Elkey5819', {
                expiresIn: '1h'
            });
            
            return {
                userId: "ParishDigital",
                token: token,
                tokenExpiration: 1
            };
        },
        createUser: (args) => {
            const userInput = args.userInput;
            return userInput;
        }
    },
    graphiql: true,
}));

app.get('/', (req, res) => res.send('Parish Digital backend'));

app.listen(port, () => console.log(`App listening on port ${port}`))