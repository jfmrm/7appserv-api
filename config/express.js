import express from 'express';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import mysql from 'promise-mysql';

let app = express();

app.locals.routes = {
};

app.dbConnection = mysql.createPool({
  host           : '172.19.0.2',
  user           : 'root',
  password       : 'hgs21@2017',
  database       : '7appserv_db',
  connectionLimit: 5
});

app.set('port', 3000);
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

export const App = app;
