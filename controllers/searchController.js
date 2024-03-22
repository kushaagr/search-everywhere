import { spawn } from 'node:child_process';
import axios from 'axios';
import 'dotenv/config';


// const search_results_get = function(req, res, next) {
//     console.log('req.query = ', req.query);
//     if (req.query.q != undefined && req.query.q.trim()) {
//         const searchQuery = req.query.q;
//         console.log(`Query for ${searchQuery}`);
//         res.send({
//             'searchQuery': searchQuery,
//             'timestamp': Date.now(),
//         });
//     } else 
//         // res.send({
//         //     'timestamp': Date.now(),
//         // });
//         res.redirect('/')
// }

const search_results_get = async function(req, res, next) {
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
            res.send(flatResponse);
            
        } catch (error) {
            console.error(error);
            next();
        }

    }
    
}


function fetchDuckduckgo(query, limit=1) {
    return new Promise((resolve, reject) => {
        limit = limit * 1;
        const per_page = Number.isInteger(limit) ? limit : 1;
        const ddgr = spawn('ddgr', ['--num', `${per_page}`, '--json', `${query}`]);

        let output = {};
        ddgr.stdout.on('data', (data) => {
            output = JSON.parse(data);
        });

        ddgr.on('exit', (code, signal) => {
          if (code === 0) {
            resolve({ 'duckduckgo': output }); // Process exited sucjcessfully, resolve with output
          } else {
            reject(new Error(`Process ${workerId} exited with error code ${code}`)); // Process error, reject promise
          }
        });

        // ddgr.stderr.on('data', (stderr) => {
        //     console.log(`stderr: ${stderr}`);
        //     reject(stderr)
        // });

        // ddgr.on('error', (error) => {
        //     console.error(`error: ${error.message}`);
        //     reject(error.message);
        // });

        // ddgr.on('close', (code) => {
        //     console.log(`child process exited with code ${code}`);
        // });

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


export { search_results_get }