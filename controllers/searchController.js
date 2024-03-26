import { spawn } from 'node:child_process';
import DDG from 'duck-duck-scrape';
import axios from 'axios';
import 'dotenv/config';
    
const search_results_get = (req, res, next) => {
    if (!req.query.q || req.query.q.trim() === '') {
       // Define the problem details according to RFC 9457
       const problemDetails = {
         // "type": "/probs/missing-query-param",
         "type": "https://example.com/probs/missing-query-param",
         "title": "Missing or Empty Query Parameter",
         "status": 400,
         "detail": "The query parameter 'q' is missing or empty. Please provide a value for 'q'.",
         "instance": req.originalUrl
       };

       // Send the response with the problem details
       res.status(400).type('application/problem+json').send(problemDetails);
    } else {
       // res.send(`Searching for: ${req.query.q}`);
        fetchResponse(req, res).then(result => {
            res.send(result);
        }).catch(next);
    }
}

async function fetchResponse(req) {

    const query = req.query.q;
    const per_page = (req.query.per_page || 15) * 1;

    try {
        const results = await Promise.all([
            fetchDuckduckgo(query, per_page).catch(err => {
                throw new Error(`Error fetching Duckduckgo results: ${err}`);
            }),
            fetchGithub(query, per_page).catch(err => {
                throw new Error(`Error fetching Github results: ${err}`);
            }),
            fetchReddit(query, per_page).catch(err => {
                throw new Error(`Error fetching Reddit results: ${err}`);
            }),
            fetchYoutube(query, per_page).catch(err => {
                throw new Error(`Error fetching Youtube results: ${err}`);
            }),
        ]);

        const flatResponse = {};
        for (const item of results) {
            for (const [key, value] of Object.entries(item)) {
                flatResponse[key] = value;
            }
        }
        // res.send(flatResponse);
        return flatResponse;
        
    } catch (error) {
        console.error(error);
        throw error;

    }

    
}

function fetchDuckduckgo(query, limit=1) {
    return new Promise( async (resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        try {
            const searchResults = await DDG.search(query, {
              safeSearch: DDG.SafeSearchType.STRICT
            });

            if (searchResults.noResults === true) {
                throw new Error("No results");
            }
            resolve({'duckduckgo': searchResults.results.slice(0, per_page)});
        } catch (error) {
            reject(error);
        }

    });
}


function fetchGithub(query, limit=1) {
    return new Promise( async (resolve, reject) => {
        limit = limit * 1;
        query = encodeURIComponent(query);
        const page_num = 1;
        const per_page = Number.isInteger(limit) ? limit : 1;
        try {
            const response = await axios.get(`https://api.github.com/search/repositories?q=${query}&per_page=${per_page}&page=${page_num}`);
            // console.log("Github data:")
            // console.log(response.status);
            // console.log(response.data);
            resolve({ 'github': response.data.items });
        } catch (error) {
            reject(error);
        }
        
    })
}

function fetchYoutube(query, limit=1) {
    return new Promise( async (resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        const options = {
          method: 'GET',
          url: 'https://youtube-v31.p.rapidapi.com/search',
          params: {
            q: query,
            part: 'snippet,id',
            regionCode: 'IN',
            maxResults: `${per_page}`,
            order: 'date'
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPID_API,
            'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
          }
        };

        try {
            const response = await axios.request(options);
            resolve({ 'youtube': response.data.items });

        } catch (error) {
            console.error(error);
        }
    })
}

function fetchReddit(query, limit=1) {
    return new Promise( async (resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        const redditSearchUrl = new URL('https://www.reddit.com/search.json');
        redditSearchUrl.searchParams.append('limit', per_page);
        redditSearchUrl.searchParams.append('q', query);

        try {
            const response = await axios.get(redditSearchUrl);
            resolve({ 'reddit': response.data.data.children });
        } catch (error) {
            reject(error);
        }

    })
}


export { search_results_get, fetchResponse }