import express from 'express';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import mysql from 'promise-mysql';
import { UserRouter } from '../app/routes';

let app = express();

app.set('port', 3000);
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/api/users', UserRouter);

export const App = app;
