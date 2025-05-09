// npm run dev
// ctrl alt 'down'
// For the .env -- require('crypto').randomBytes(64).toString('hex')
const express = require('express'); 
const app = express(); 
const path = require('path'); 
const cors = require('cors'); 
const corsOptions = require('./config/corsOptions'); 
const { logger } = require('./middleware/logEvents'); 
const errorHandler = require('./middleware/errorHandler'); 
const verifyJWT = require('./middleware/verifyJWT'); 
const cookieParser = require('cookie-parser'); 
const PORT = process.env.PORT || 3500;

// ========== MIDDLEWARE SETUP ========== //

// Custom middleware that logs all incoming requests (from logEvents.js)
// This helps with debugging and monitoring server activity
app.use(logger);

// Cross-Origin Resource Sharing (CORS) configuration
// Determines which external domains can access your API
// corsOptions contains the whitelist of allowed origins
app.use(cors(corsOptions));

// Middleware to handle URL-encoded form data (like traditional form submissions)
// extended: false means it uses the querystring library for parsing
app.use(express.urlencoded({ extended: false }));

// Middleware to parse cookies attached to incoming requests
// Needed for features like authentication tokens stored in cookies
app.use(cookieParser());

// Built-in Express middleware to parse JSON data from requests
// Allows the server to automatically parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory (CSS, images, client-side JS)
// These files are accessible directly from the root URL
app.use('/', express.static(path.join(__dirname, '/public')));

// ========== ROUTE SETUP ========== //

// Route handlers - these delegate to separate route files for better organization
app.use('/', require('./routes/root')); // still serves index.html

app.use('/register', require('./routes/register')); // User registration
app.use('/auth', require('./routes/auth')); // Authentication (login)
app.use('/refresh', require('./routes/refresh')); // Token refresh endpoint
app.use('/logout', require('./routes/logout')); // Logout functionality

// ========== PROTECTED ROUTES ========== //

// All routes after this middleware will require JWT verification
// verifyJWT checks for valid authentication tokens before proceeding
app.use(verifyJWT);
app.use('/userData', require('./routes/api/viewUserData'));   // must have json anyways

// Protected API routes (require valid JWT)
app.use('/employees', require('./routes/api/employees'));

// ========== ERROR HANDLING ========== //

// 404 catch-all handler (must come after all other routes)
// This handles any request that doesn't match defined routes
app.all(/.*/, (req, res) => {
    res.status(404);
    // Respond with different content types based on what the client accepts
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found"});
    } else if (req.accepts('txt')) {
        res.type('txt').send('error: "404 Not Found');
    }
});

// Custom error handler middleware
// This catches and processes any errors thrown in routes
app.use(errorHandler);

// ========== SERVER STARTUP ========== //

// Start the server and listen on the specified PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Note: This runs on localhost by default (accessible at http://localhost:3500)
// app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));  // -- this works with lan

// -- How to get server running on your device --
// 1. Download node.js
// 2. Open up the project folder in visual studio code
// 3. Open up visual studio code's terminal and "You may not need to" (type npm init -y to initiate packages)
// 4. Press npm install to download all the packages - you will need to
// 5. in terminal, type npm dev run -- this will run either on local host or lan depending on config above