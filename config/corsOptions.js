// instead of google, put the front-end location to connect here.
const whitelist = [
    'https://www.google.com',
    'http://127.0.0.1:5500',
    'http://localhost:3500',
    'YOUR_IP_HERE' 
];
const corsOptions = {
    // these 2 origins are not the same, documentation confusing
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;