const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: 'us-east-1'
});
const SES = new AWS.SES();
exports.handler = function (event, context, callback) {
    const accountId = '359139714381';
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/' + accountId + '/MyQueue';

    let params = {
        MessageBody: event.body,
        QueueUrl: queueUrl
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("test10")
            console.log('error:', "failed to send message" + err);
            let responseBody = {
                message: 'failed to send message'
            };
            let response = {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseBody)
            };

            callback(null, response);
        } else {
            try {
                console.log("test1")
                const { to, from, subject, text } = JSON.parse(event.body);
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
                console.log("test2")

                SES.sendEmail(param, (err, data) => {
                    if (err) {
                        console.log("test3")
                        let response = {
                            statusCode: 401,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(err)
                        };
                        callback(null, response);
                    }
                    else {
                        console.log("test4")
                        let paramss = {
                            QueueUrl: queueUrl,
                        };

                        sqs.receiveMessage(paramss, (err, data) => {
                            console.log("test5")
                            if (err) {
                                console.log("test6")
                                console.log(err);
                                let response = {
                                    statusCode: 401,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(err)
                                };
                                callback(null, response);

                            } else {
                                console.log("test7")
                                let responseBodyv = {
                                    message: data,
                                    details: JSON.parse(event.body)
                                };

                                let response = {
                                    statusCode: 200,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(responseBodyv)
                                };
                                callback(null, response);
                            }
                        })
                    }
                })
            } catch (error) {
                console.log("test8")
                console.log('error sending email ', error);
                return Responses._400({ message: 'The email failed to send' });
            }
        }
    });
}