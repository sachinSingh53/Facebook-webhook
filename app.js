require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');



app.get('/', (req, res) => {
    res.send("HI");
})

app.get('/webhook', (req, res) => {

    let VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }

})
app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Gets the body of the webhook event

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`listing on ${PORT}`);
})