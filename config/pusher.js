import Chatkit from 'pusher-chatkit-server';

export const chatkit = new Chatkit({
    instanceLocator: process.env.PUSHER_INSTACE_LOCATOR,
    key: process.env.PUSHER_KEY,
});