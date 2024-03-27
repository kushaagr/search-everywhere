import express from 'express';
import { rateLimit } from 'express-rate-limit'

import apiRouter from './routes/api.js';
import problemTypeRouter from './routes/descriptions.js';
import pageRouter from './routes/pages.js'

// const apiRouter = require('./searchpage');
// import router from './searchpage.js';
// import { default as apiRouter } from './routes/api.js';

const app = express();
const port = parseInt(process.env.PORT) || 3000;

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 24 hrs.
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// app.get('/', (req, res) => {
//     res.send('Successful boot!');
// });
// app.get("/helloworld", (req, res) => {
//     res.render("helloworld");
// })
app.use("/", pageRouter);
app.use("/api", apiRouter);
app.use("/prob", problemTypeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // next(createError(404));

    if (req.accepts('html')) {
        
        res.status(404).end();
        // res.render('404', { url: req.url });
        return;
    }

    if (req.accepts('json')) {
        
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
        return;
    }

    res.status(404).end("Page not found");
    // res.sendStatus(404);

});

app.listen(port, () => console.log(
    `This app is listening on port http://localhost:${port}.`
));
