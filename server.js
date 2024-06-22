/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Vithursh Thananchayan
Student ID: 116751231
Date: June 7th, 2024
Vercel Web App URL: https://web322-assignment-2-39u0y819l-vithurshs-projects.vercel.app/
GitHub Repository URL: https://github.com/Sc0rpi0n616/Web322_Assignment-2.git
********************************************************************************/

// Import necessary modules
const { error } = require('console');
const myModule = require('./store-service');
const express = require('express');
const path = require('path');

// Create an Express application
const app = express();

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dzbzxreyj',
    api_key: '776444474546235',
    api_secret: 'jpK4YbwSmVaimhDjXC9NKHVHf3I',
    secure: true
});

const upload = multer();

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

// Define a route for GET requests to '/items'
app.get('/items', (req, res) => {

    // Extract 'category' and 'minDate' from the query parameters
    const category = req.query.category;
    const minDateStr = req.query.minDate;

    // If 'category' is provided in the query parameters
    if (category) {
        // Call the 'getItemsByCategory' function from 'myModule'
        // This function returns a Promise that resolves with the items in the specified category
        myModule.getItemsByCategory(category)
        .then(items => res.json(items)) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.status(500).json({message: err})); // If the Promise rejects, send a 500 status code and the error message
    } 
    // If 'minDateStr' is provided in the query parameters
    else if (minDateStr) {
        // Call the 'getItemsByMinDate' function from 'myModule'
        // This function returns a Promise that resolves with the items that have a postDate greater than or equal to 'minDateStr'
        myModule.getItemsByMinDate(minDateStr)
        .then(items => res.json(items)) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.status(500).json({message: err})); // If the Promise rejects, send a 500 status code and the error message
    } 
    // If neither 'category' nor 'minDateStr' is provided in the query parameters
    else {
        // Call the 'getAllItems' function from 'myModule'
        // This function returns a Promise that resolves with all items
        myModule.getAllItems()
        .then(items => res.json(items)) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.status(500).json({message: err})); // If the Promise rejects, send a 500 status code and the error message
    }
});

// Define a route for GET requests to '/items/add'
app.get('/items/add', (req, res) => {
    // Send the 'addItem.html' file as a response
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

// Define a route for GET requests to '/item/:id', where ':id' is a placeholder for the item ID
app.get('/item/:id', (req, res) => {
    // Extract the item ID from the route parameters
    const id = req.params.id;

    // Call the 'getItemById' function from 'myModule' with the item ID
    // This function returns a Promise that resolves with the item with the specified ID
    myModule.getItemById(id)
        .then(items => res.json(items)) // If the Promise resolves, send the item as a JSON response
        .catch(err => res.status(500).json({message: err})); // If the Promise rejects, send a 500 status code and the error message
});

// Define a route for POST requests to '/items/add'
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    // If a file was uploaded in the 'featureImage' field of the form
    if(req.file) {
        // Define a function to upload the file to Cloudinary
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                // Create an upload stream to Cloudinary
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    // If the upload is successful, resolve the Promise with the result
                    if (result) {
                        resolve(result);
                    } else {
                        // If the upload fails, reject the Promise with the error
                        reject(error);
                    }
                });
                // Pipe the file data into the upload stream
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        
        // Define an async function to call 'streamUpload'
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        
        // Call 'upload' and then process the item with the URL of the uploaded image
        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
        
    } else {
        // If no file was uploaded, process the item without an image URL
        processItem("");
    }
    
    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        // TODO: Process the req.body and add it as a new Item before redirecting to /items

         // Use the addItem function to add the new item
         myModule.addItem(req.body)
         .then(item => {
           console.log('Item added:', item);
           // TODO: Redirect the user to the /items route
        //    res.sendFile(path.join(__dirname, '/views/addItem.html'));
           res.redirect('/items');
         })
         .catch(error => {
           console.error('Error adding item:', error);
           // TODO: Handle error
       });
    }
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