import { spawn } from 'node:child_process';
import DDG from 'duck-duck-scrape';
import { Client } from 'youtubei';
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

function fetchResponse(req) {

    const query = req.query.q;
    let per_page = (req.query.per_page || 15) * 1;
    if (per_page < 0) {
        per_page = 15;
    }
    
    return Promise.allSettled([
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

    ]).then(results => {
        const flatResponse = {};
        const errors = [];
        // Convert array of Objects to single object.
        for (const item of results) {
            if (item.status === 'fulfilled') {
                const data = item.value;

                for (const [key, value] of Object.entries(data)) {
                    flatResponse[key] = value;
                }
            } else {
                errors.push(item.reason);
            }
        }
        if (errors && errors.length !== 0) console.error(errors);
        return flatResponse;
        // res.send(flatResponse);

    }).catch(error => {
        throw error;
    })
    
}

function fetchDuckduckgo(query, limit=1) {
    return new Promise( (resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        DDG.search(query, {
          safeSearch: DDG.SafeSearchType.STRICT
        }).then(searchResults => {
            if (searchResults.noResults === true) {
                const error =  new Error("No results for Duckduckgo");
                reject(error)
            }
            resolve({'duckduckgo': searchResults.results.slice(0, per_page)});
        }).catch(error => {
            reject(error);
        })


    });
}


function fetchGithub(query, limit=1) {
    return new Promise( (resolve, reject) => {
        limit = limit * 1;
        query = encodeURIComponent(query);
        const page_num = 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        axios.get(
            `https://api.github.com/search/repositories?q=${query}&per_page=${per_page}&page=${page_num}`
        ).then(response => {
            if (!response.data.items || response.data.items.length === 0) {
                // console.log("no items for github");
                reject(new Error("No results for Github"));
            } else {
                resolve({ 'github': response.data.items });
            }
        }).catch(error => {
            reject(error);
        });
        
    })
}

function fetchYoutube(query, limit=1) {
    // max allowed by youtubei = 20
    const per_page = Number.isInteger(limit * 1) ? limit : 1;

    const youtube = new Client();
    return youtube.search(query, {
        type: "video",
    }).then(response => {
        // resolve({ 'youtube': response.items });
        return ({ 'youtube': response.items.slice(0, per_page) });
    }).catch(error => {
        // reject(error);
        throw error;
    });
}


function deprecated_fetchYoutube(query, limit=1) {
    return new Promise( (resolve, reject) => {
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

        axios.request(options).then(response => {
            resolve({ 'youtube': response.data.items });
        }).catch(error => {
            reject(error);
        })
    })
}

function fetchReddit(query, limit=1) {
    return new Promise( (resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;

        const redditSearchUrl = new URL('https://www.reddit.com/search.json');
        redditSearchUrl.searchParams.append('limit', per_page);
        redditSearchUrl.searchParams.append('q', query);

        axios.get(redditSearchUrl).then(response => {
            resolve({ 'reddit': response.data.data.children });
        }).catch(error => {
            reject(error);
        });

    })
}


export { search_results_get, fetchResponse }