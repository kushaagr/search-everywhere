// const express = require('express');
import express from 'express';

// const apiRouter = require('./searchpage');
// import router from './searchpage.js';
// import { default as apiRouter } from './routes/api.js';
import apiRouter from './routes/api.js';
import problemTypeRouter from './routes/descriptions.js';

const app = express();
const port = parseInt(process.env.PORT) || 3000;

app.use(express.static('public'));

app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.send('Successful boot!');
// });

app.use("/api", apiRouter);
app.use("/prob", problemTypeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // next(createError(404));

    const problemDetails = {
        type: "https://example.com/probs/not-found",
        title: "Not Found",
        status: 404,
        detail: "The requested resource could not be found on this server.",
        instance: req.originalUrl
    };

    res.status(404).type('application/problem+json').send(problemDetails);

    // res.status(404).send({
    //   "statusCode": 404,
    //   "statusMessage": "The requested resource could not be found"
        
    // })
});

app.listen(port, () => console.log(
    `This app is listening on port ${port}.`
));