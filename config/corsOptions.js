// The locations allowed to access our data.
// Put your ip here when hosting
const whitelist = [
    'https://www.google.com',
    'http://127.0.0.1:5500',
    'http://localhost:3500',
    'http://your_ip'
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // REQUIRED for cookies, authorization headers. So much pain figuring this out.
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

module.exports = corsOptions;