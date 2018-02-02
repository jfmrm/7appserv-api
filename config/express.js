import express from 'express';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import mysql from 'promise-mysql';
import { CostumerUserRouter,
         ProUserRouter,
         CostumerActionsRouter } from '../app/routes';

let app = express();

app.set('port', (process.env.PORT || 3000));
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/api/costumers/users', CostumerUserRouter);
app.use('/api/pros/users', ProUserRouter);
app.use('/api/costumers', CostumerActionsRouter);

export const App = app;
