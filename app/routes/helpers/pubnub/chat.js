import PubNub from 'pubnub';

export function startChat(proId, customerId, message) {
    let customer = new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
        secretKey: process.env.PUBNUB_SECRET_KEY,
        uuid: customerId
    });

    let pro = new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
        secretKey: process.env.PUBNUB_SECRET_KEY,
        uuid: proId
    })

    customer.subscribe({
        channels: [`${proId}:${customerId}`]
    });

    pro.subscribe({
        channels: [`${proId}:${customerId}`]
    });

    pro.publish({
        message,
        channel: `${proId}:${customerId}`
    }).then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    });

}

export function refreshDeviceSubscription(deviceToken) {
    let pubnub = new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
        secretKey: process.env.PUBNUB_SECRET_KEY,
    });

    pubnub.push.listChannels({
        device: deviceToken,
        pushGateway: 'gcm'
    }).then((channels) => {
        
    })
}