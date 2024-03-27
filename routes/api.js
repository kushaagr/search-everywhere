import express from 'express';
import { search_results_get } from '../controllers/searchController.js';

const router = express.Router();
// const search_controller = require("./searchController");
router.get("/search", 
    search_results_get, 
    (err, req, res, next) => {
        const problemDetails = {
            type: "/probs/api-error",
            title: "API Error",
            status: 500,
            detail: err.message,
            instance: req.originalUrl
        };
        res.status(500).type('application/problem+json').send(problemDetails);
    }
);

// catch 404 and forward to error handler
router.use(function(req, res, next) {
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

// module.exports = router;
export default router;