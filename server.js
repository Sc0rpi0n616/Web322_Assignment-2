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

// Define a route for '/items' that fetches all items and sends them as a JSON response
app.get('/items', (req, res) => {

    const category = req.query.category;
    const minDateStr = req.query.minDate;

    if (category) {
        // If a category was provided, get items in that category
        myModule.getItemsByCategory(category)
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
    } else if (minDateStr) {
        myModule.getItemsByMinDate(minDateStr)
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));        
    } else {
        myModule.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
    }
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

app.get('/item/:id', (req, res) => {

    const id = req.params.id;

    myModule.getItemById(id)
        .then(items => res.json(items))
        .catch(err => res.status(500).json({message: err}));
});

app.post('/items/add', upload.single("featureImage"), (req, res) => {
    
    if(req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        
        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
        
    } else {
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