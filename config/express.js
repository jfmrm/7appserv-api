import express from 'express';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import mysql from 'promise-mysql';
import { CustomerUserRouter,
         ProUserRouter,
         DemandRouter,
         QuotationRouter,
         ServiceRouter,
         ServiceTypeRouter } from 'routes';

let app = express();

app.set('port', (process.env.PORT || 3000));
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/api/customers/users', CustomerUserRouter);
app.use('/api/pros/users', ProUserRouter);
app.use('/api/demands', DemandRouter);
app.use('/api/demands/quotations', QuotationRouter);
app.use('/api/demands/services', ServiceRouter);
app.use('/api/adm/service_types', ServiceTypeRouter);

export const App = app;
