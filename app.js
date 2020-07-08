// Imports
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transport = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
}

const transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take messages');
  }
});

// QUOTE FORM
router.post('/service', (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const message = req.body.message
    const content = `Name: ${name}\nEmail: ${email}\nMessage: ${message} `

    const mail = {
        from: name,
        to: 'Econway24@gmail.com',
        subject: 'New Submission for Customer Success Stories',
        text: content
    }

    transporter.sendMail(mail, (err, data) => {
        if (err) {
            res.json({
                status: 'fail'
            })
        } else {
            res.json({
                status: 'success'
            })

            transporter.sendMail({
                from: "Econway24@gmail.com",
                to: email,
                subject: "Submission was successful",
                text: `Thank you for contacting us! Your Customer Success Stories Pricing and Process details are attached to this email.\n\nWe will reply with a quote shortly.\n\nFORM DETAILS:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
                attachments: [
                    {   // use URL as an attachment
                        filename: 'Customer Success Stories Pricing and Process.pdf',
                        path: 'https://drive.google.com/uc?export=download&id=1DD7TmtgpqFXKaqmYYH0-zWoShxePjsM5'
                    }
                ]
            }, function(error, info){
                if(error) {
                    console.log(error);
                } else{
                    console.log('Message sent: ' + info.response);
                }
            });
        }
    })
})

// GRAPHQL
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');

const { buildSchema } = require('graphql');

// Password Encryption and Token
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');

// Initialize Port and App
let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

const app = express();

// app.use(bodyParser.json());

// app.use((req, res, next) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
// 	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

// 	if (req.method === 'OPTIONS') {
// 		return res.sendStatus(200);
// 	}

// 	next();
// })

// allow cross-origin requests
app.use(cors());

// Attach GraphQL
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type User {
            _id: ID!
            username: String!
            password: String!
        }
        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }
        input UserInput {
            username: String!
            password: String!
        }

        type RootQuery {
            login(username: String!, password: String!): AuthData!
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
        login: async ({ username, password }) => {
            const user = await User.findOne({ username: username });
            if(!user) {
                throw new Error('User does not exist!');
            }

            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                throw new Error('Password is incorrect!');
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, 'Elkey5819', {
                expiresIn: '1h'
            })

            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            }
        },
        createUser: async args => {
            try {
                const existingUser = await User.findOne({ username: args.userInput.username });
                if (existingUser) {
                    throw new Error('User already exists!')
                }

                const hashPassword = await bcrypt.hash(args.userInput.password, 12);
                const user = new User({
                    username: args.userInput.username,
                    password: hashPassword
                });

                const result = await user.save();
                return { ...result._doc };
            } catch (err) {
                throw err;
            }
        }
    },
    graphiql: true,
}));

app.use(express.json())
app.use('/', router)

mongoose.connect(`
    mongodb+srv://Elliott:00j0reNKGrWYXDu2@pd-backend-01-lasaf.gcp.mongodb.net/pd-backend?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(port, () => console.log(`App listening on port ${port}`))
})
.catch(err => {
    console.log(err);
})
