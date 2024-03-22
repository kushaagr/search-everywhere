import express from 'express';
import { search_results_get } from '../controllers/searchController.js';

const router = express.Router();
// const search_controller = require("./searchController");
router.get("/search", search_results_get, (err, req, res, next) => {
    const problemDetails = {
        type: "https://example.com/probs/api-error",
        title: "API Error",
        status: 500,
        detail: err.message,
        instance: req.originalUrl
    };

    res.status(500).type('application/problem+json').send(problemDetails);
});

// module.exports = router;
export default router;