import { Firebase } from '../firebase';

export function auth (req, res, next) {
    let token = req.headers.token;

    Firebase.auth().verifyIdToken(token, true)
        .then((payload) => {
            req.userId = payload.uid;
            next();
        }).catch(error => {
            if (error.code == 'auth/id-token-revoked') {
                res.status(403).json({ message: "token has been revoked" })    
            } else {
                res.status(403).json({ message: "token is invalid" })
            }
        })
}