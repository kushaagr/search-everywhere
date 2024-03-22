// const express = require('express');
import express from 'express';

// const apiRouter = require('./searchpage');
// import router from './searchpage.js';
// import { default as apiRouter } from './routes/api.js';
import apiRouter from './routes/api.js';

const app = express();
const port = parseInt(process.env.PORT) || 3000;

app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.send('Successful boot!');
// });

app.use("/api/", apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // next(createError(404));
    res.status(404).send({
      "statusCode": 404,
      "statusMessage": "The requested resource could not be found"
        
    })
});

app.listen(port, () => console.log(
    `This app is listening on port ${port}.`
));