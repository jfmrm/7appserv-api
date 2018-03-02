import http from 'http';

//iniciates express instance
//database connection is made into express.js
import { App } from './config';

//listen on port
http.createServer(App).listen(App.get('port'), function() {
  console.log('Express server listening on port ' + App.get('port'));
});
