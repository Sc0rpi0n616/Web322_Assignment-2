// Import necessary modules
const { error } = require('console');
const myModule = require('./store-service');
const express = require('express');
const path = require('path');

// Create an Express application
const app = express();

// Define the port the server will listen on
const PORT = 8000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route for the root path ('/') that redirects to '/about'
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Define a route for '/about' that sends the 'about.html' file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Define a route for '/shop' that fetches published items and sends them as a JSON response
app.get('/shop', (req, res) => {
    myModule.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
});

// Define a route for '/items' that fetches all items and sends them as a JSON response
app.get('/items', (req, res) => {
    myModule.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
});

// Define a route for '/categories' that fetches all categories and sends them as a JSON response
app.get('/categories', (req, res) => {
    myModule.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({message: err}));
});

// Define a middleware function that sends a 404 page for any unhandled routes
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
});

// Initialize the data and start the server
myModule.initialize()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port: ${PORT}`);
    });
})
.catch((error) => {
    // Output the error to the console if the initialize method fails
    console.error('Failed to initialize the server:', error);
});