import express from 'express';

import { fetchResponse } from '../controllers/searchController.js';

const router = express.Router();

router.get("/", (req, res) => {
    if (!req.query.q || req.query.q.trim() === '') {
        res.render("index");
    } else {
        fetchResponse(req).then((response) => {
            // console.log(response['duckduckgo'] ? response['duckduckgo'].slice(0, 3) : null); 
            // console.log(response['reddit'] ? response['reddit'].slice(0, 1) : null); 
            const now = new Date();
            // console.log(response['duckduckgo']);
            // res.send(response['duckduckgo'].slice(0, 3));
            res.render("search", { searchresults: response, searchquery: req.query.q});
            console.log(`Data sent @ ${now.toLocaleString()}`);
            return;
        }).catch(err => {
            console.error(`error.response = ${err}`)
            // res.sendStatus(500);
            res.status(500).end();
            return;
        });
    }

})

    
export default router;