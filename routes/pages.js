import express from 'express';

import { fetchResponse } from '../controllers/searchController.js';

const router = express.Router();

router.get("/", (req, res) => {
    if (!req.query.q || req.query.q.trim() === '') {
        res.render("index");
    } else {
        fetchResponse(req).then((response) => {
            console.log(response['duckduckgo'] ?? response['duckduckgo'].slice(0, 3));  
            // res.send(response['duckduckgo'].slice(0, 3));
            res.render("search", { searchresults: response });
        });   
    }

})
    
export default router;