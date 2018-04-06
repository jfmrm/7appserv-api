import PubNub from 'pubnub';

export function startChat(proId, customerId, message) {
    let pubnub = new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
        secretKey: process.env.PUBNUB_SECRET_KEY,
        uuid: customerId
    });

    pubnub.addListener({
        status: function(statusEvent) {
            return new Promise((resolve, reject) => {
                if (statusEvent.category === "PNConnectedCategory") {
                    pubnub.publish({
                        channel: `${proId}:${customerId}`,
                        message
                    }, (status, response) => {
                        if (status.error == true) {
                            reject(status)
                        }
                        resolve(response)
                    })
                }
            })
        },
        message: function(message) {
            console.log("New Message!!", message);
        }
    });

    pubnub.subscribe({ channels: [`${proId}:${customerId}`]});
}