// npm run dev
// ctrl alt 'down'
// For the .env -- require('crypto').randomBytes(64).toString('hex')
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3500;

// custom middeware logger, from middleware/logEvents
app.use(logger);

// cross origiion resoirce sharing
// what sites can grab your data


app.use(cors(corsOptions));

// middle-ware that handle urlencoded data. 'form data'
app.use(express.urlencoded({ extended: false }));

//middleware for cookies
app.use(cookieParser());

// built-in middleware for json
app.use(express.json());

// Serve static files, like css and images
app.use('/', express.static(path.join(__dirname, '/public')));

// roots
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT); // must verify if they want to gather information
app.use('/employees', require('./routes/api/employees'));

// 404 fallback (must come last)
app.all(/.*/, (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found"});
    } else if (req.accepts('txt')) {
        res.type('txt').send('error: "404 Not Found');
    }
});

// comments 
app.use(errorHandler);

// Start server

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  //--- this is purely local host. run with -> [localhost:3500]
// app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));  // -- this works with lan

// -- How to get server running on your device
// 1. Download node.js
// 2. Open up the project folder in visual studio code
// 3. Open up visual studio code's terminal and "You may not need to" (type npm init -y to initiate packages)
// 4. Press npm install to download all the packages - you will need to
// 5. in terminal, type npm dev run -- this will run either on local host or lan depending on config above