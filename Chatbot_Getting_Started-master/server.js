const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();

const dialogFlowAccessToken = '0433d782d5574dd19b32ec6746a4877c';
const facebookAccessToken = 'EAAWZCZAIzkFPcBAHyPLuqjkHDdrDRYyWZBbDRd3HmcFPdxovwMJVSdsGNPhfaRJHZAVvhorL1MoWB8ILKVTwvNL3po4HEitM56kmATDylV3PNU9GiTQO9NA8ZCIRHc0NhGd0JdTD9fbP3eXFDN8Cx1ZClH63429ZBwt0E2McIRvQwZDZD';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    if (req.query['hub.challenge']) res.send(req.query['hub.challenge']);
});

app.post('/webhook', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {

            let webhook_event = entry.messaging[0];

            /*

            DialogFlow 

            */
            fetch('https://api.dialogflow.com/v1/query?v=20170712', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${dialogFlowAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: webhook_event.message.text,
                    sessionId: webhook_event.sender.id
                })
            })
            .then(res => res.json())
            .then((json) => {
                let sessionId = json.sessionId;
                let answer = json.result.fulfillment.speech;

                fetch(`https://graph.facebook.com/v2.6/me/messages?access_token=${facebookAccessToken}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "recipient":{
                          "id": sessionId
                        },
                        "message":{
                          "text": answer
                        }
                    })
                })
                .then(res => res.json())
                .then((json) => {
                    res.status(200);
                });
            });
            /*

            /DialogFlow

            */

        });
    } 
});

app.listen(3000, () => console.log('Chatbot started!'));