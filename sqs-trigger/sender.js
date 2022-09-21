const AWS = require('aws-sdk');
const Responses = require('./API_Responses')
const SQS = new AWS.SQS({
    region: 'us-east-1'
});
const SES = new AWS.SES();
exports.handler = function (event, context, callback) {
    const accountId = '359139714381';
    const queueUrl = 'https://SQS.us-east-1.amazonaws.com/' + accountId + '/MyQueue';

    let params = {
        MessageBody: event.body,
        QueueUrl: queueUrl
    };
    SQS.sendMessage(params, function (err, data) {
        if (err) {
            let response = Responses._400({
                message: 'failed to send message',
            })
            callback(null, response);
        }
        else {
            try {
                const { to, from, subject, text } = JSON.parse(event.body);
                if (!to || !from || !subject || !text) {
                    let response = Responses._400({
                        message: 'to, from, subject and text are all required in the body',
                    })
                    callback(null, response);
                }
                const param = {
                    Destination: {
                        ToAddresses: [to],
                    },
                    Message: {
                        Body: {
                            Text: { Data: text },
                        },
                        Subject: { Data: subject },
                    },
                    Source: from,
                };

                SES.sendEmail(param, (err, data) => {
                    if (err) {
                        let response = Responses._400({ message: 'Enter registered mail id ', })
                        callback(null, response);
                    }
                    else {
                        let paramss = { QueueUrl: queueUrl, };
                        SQS.receiveMessage(paramss, (err, data) => {
                            if (err) {
                                reponse = Responses._400({
                                    message: 'Message failed to recieved',
                                })
                                callback(null, response);
                            }
                            else {
                                response = Responses._200({
                                    message: data,
                                    details: JSON.parse(event.body)
                                })
                                callback(null, response);
                            }
                        })
                    }
                })
            } catch (error) {
                reponse = Responses._400({
                    message: 'The email failed to send',
                })
                callback(null, response);
            }
        }
    });
}