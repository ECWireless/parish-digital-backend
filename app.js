const express = require('express');
const bodyParser = require('body-parser');

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

app.get('/', (req, res) => res.send('Parish Digital backend'));

app.listen(port, () => console.log(`App listening on port ${port}`))