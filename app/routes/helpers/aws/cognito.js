import https from 'https';
import jose from 'node-jose';

let region = 'ap-southeast-2';
let userpool_id = 'ap-southeast-2_xxxxxxxxx';
let app_client_id = '<ENTER APP CLIENT ID HERE>';
let keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';

export function auth (req, res, callback) {
    let token = req.header.token;
    let sections = token.split('.');
    // get the kid from the headers prior to verification
    let header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    let kid = header.kid;
    // download the public keys
    https.get(keys_url, function(response) {
        if (response.statusCode == 200) {
            response.on('data', function(body) {
                let keys = JSON.parse(body)['keys'];
                // search for the kid in the downloaded public keys
                let key_index = -1;
                for (let i=0; i < keys.length; i++) {
                        if (kid == keys[i].kid) {
                            key_index = i;
                            break;
                        }
                }
                if (key_index == -1) {
                    console.log('Public key not found in jwks.json');
                    callback('Public key not found in jwks.json');
                }
                // construct the public key
                jose.JWK.asKey(keys[key_index]).
                then(function(result) {
                    // verify the signature
                    jose.JWS.createVerify(result).
                    verify(token).
                    then(function(result) {
                        // now we can use the claims
                        let claims = JSON.parse(result.payload);
                        // additionally we can verify the token expiration
                        current_ts = Math.floor(new Date() / 1000);
                        if (current_ts > claims.exp) {
                            callback('Token is expired');
                        }
                        // and the Audience (use claims.client_id if verifying an access token)
                        if (claims.aud != app_client_id) {
                            callback('Token was not issued for this audience');
                        }
                        callback(null, claims);
                    }).
                    catch(function() {
                        callback('Signature verification failed');
                    });
                });
            });
        }
    });
}