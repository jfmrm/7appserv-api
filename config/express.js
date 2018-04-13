import express from 'express';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import mysql from 'promise-mysql';
import aws from 'aws-sdk';
import { CustomerUserRouter,
         ProUserRouter,
         DemandRouter,
         QuotationRouter,
         ServiceRouter,
         ServiceTypeAdmRouter,
         QuestionsRouter,
         ServiceTypeRouter,
         ProPaymentsRouter,
         MomentRouter,
         MomentAdmRouter,
         CityRouter } from 'routes';
import { getPro,
         getDemand } from './middlewares';
import { chatkit } from './pusher';

let awsConfig = new aws.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

let app = express();

app.set('port', (process.env.PORT || 3000));
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('/chat', (req, res) => {
    chatkit.createUser({ id: 'awsome2', name: 'mr.awsome2'}).then((data) => { res.status(200).json(data)}).catch((error) => {res.status(500).json(error)})
});
app.get('/create_chat', (req, res) => {
    chatkit.createRoom({ creatorId: 'awsome', name: 'myAWSOMEchat', userIds: ["awsome2"] })
        .then((dale) => {
            res.status(200).json(dale);
        }).catch((error) => {
            res.status(500).json(error);
        });
});
app.get('/health', (req, res) => {
    res.status(200).json('im alive');
});
app.use('/api/customers/users', CustomerUserRouter);
app.use('/api/pros/users', ProUserRouter);
app.use('/api/pros/:proId/payments', getPro, ProPaymentsRouter);
app.use('/api/service_types', ServiceTypeRouter);
app.use('/api/moments', MomentRouter);
app.use('/api/demands', DemandRouter);
app.use('/api/demands/:demandId/quotations', getDemand, QuotationRouter);
app.use('/api/services', ServiceRouter);
app.use('/api/cities', CityRouter);
app.use('/api/adm/service_types', ServiceTypeAdmRouter);
app.use('/api/adm/moments', MomentAdmRouter);
app.use('/api/adm/questions', QuestionsRouter);

export const App = app;
