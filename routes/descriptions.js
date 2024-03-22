import express from 'express';

const router = express.Router();

router.get('/api-error', (req, res) => {
    // Example error details
    const errorDetails = {
        type: "/probs/api-error",
        title: "API Error",
        status: 500,
        detail: "An error occurred while processing your request.",
        instance: req.originalUrl
    };

    // Render the error view with the error details
    res.render('error', { errorDetails });
});

router.get('/missing-query-param', (req, res) => {
    // const problemDetails = {
    //   "type": "/probs/missing-query-param",
    //   "title": "Missing or Empty Query Parameter",
    //   "status": 400,
    //   "detail": "The query parameter 'q' is missing or empty. Please provide a value for 'q'.",
    //   "instance": req.originalUrl
    // };

    res.render('error-missing-query-param');
})
    
export default router;