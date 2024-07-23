/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Vithursh Thananchayan
Student ID: 116751231
Date: June 21th, 2024
Vercel Web App URL: https://web322-assignment-2-alpha.vercel.app/
GitHub Repository URL: https://github.com/Sc0rpi0n616/Web322_Assignment-2.git
********************************************************************************/

// Import necessary modules
const { error } = require('console');
const myModule = require('./store-service');
const express = require('express');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const handlebars = require('handlebars');

// const expressHandlebars = require('express-handlebars');
const exphbs = require('express-handlebars');

const path = require('path');

// Create an Express application
const app = express();

// Create a new instance of express-handlebars
const hbHelpers = exphbs.create({
    // Set the default layout to "main"
    defaultLayout: "main",
    // Set the file extension to ".hbs"
    extname: ".hbs",
    // Set the directory for layout files
    layoutsDir: path.join(__dirname, "views/layouts"),
    // Define custom helpers
    helpers: {
        // Define a helper "navLink" for creating navigation links
        navLink: function (url, options) {
            return (
                // Return a list item with a navigation link
                // If the current route matches the url, add the "active" class
                '<li class="nav-item"><a class="nav-link' +
                (url == app.locals.activeRoute ? ' active"' : '"') +
                ' href="' +
                url +
                '">' +
                // Use the block content as the link text
                options.fn(this) +
                "</a></li>"
            );
        },
        // Define a helper "equal" for comparing two values
        equal: function (lvalue, rvalue, options) {
            // Throw an error if less than 2 parameters are provided
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            // If the values are not equal, render the inverse block
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                // If the values are equal, render the main block
                return options.fn(this);
            }
        },
    },
});

app.engine(".hbs", hbHelpers.engine);
app.set("view engine", ".hbs");

cloudinary.config({
    cloud_name: 'dzbzxreyj',
    api_key: '776444474546235',
    api_secret: 'jpK4YbwSmVaimhDjXC9NKHVHf3I',
    secure: true
});

// Configuring safeHTML
handlebars.registerHelper('safeHTML', function(text) {
    return new handlebars.SafeString(text);
});

const upload = multer();

// Define the port the server will listen on
const PORT = 8000;

// Serve static files from the 'public' directory
// app.use(express.static('public'));
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

//
// Use middleware for every request
app.use(function(req, res, next) {
    // Get the route from the request path, excluding the leading '/'
    let route = req.path.substring(1);
    // Set the active route on the app locals
    // If the second part of the route is a number, remove everything after the first '/'
    // Otherwise, remove only the first '/'
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    // Set the viewing category on the app locals from the query parameters
    app.locals.viewingCategory = req.query.category;
    // console.log('app.locals.viewingCategory:', app.locals.viewingCategory);
    // Call the next middleware or route handler
    next();
});

// Define a route for the root path ('/') that redirects to '/about'
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// Define a route for '/about' that sends the 'about.html' file
app.get('/about', (req, res) => {
    res.render('about');
});

// Define a route for '/shop' that fetches published items and sends them as a JSON response
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await myModule.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await myModule.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
      console.log("The category is:",req.query.category);
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await myModule.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });

//
app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned items by category
        if(req.query.category){
            // Obtain the published "items" by category
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "items"
            items = await itemData.getPublishedItems();
        }
  
        // sort the published items by itemDate
        items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await itemData.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await itemData.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

// app.get('/shop', (req, res) => {
//     myModule.getPublishedItems()
//         .then(items => res.json(items))
//         .catch(err => res.status(500).json({message: err}));
// });

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
        .then(items => res.render("items", {items: items})) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.render("items", {message: "No results found."})); // If the Promise rejects, send a 500 status code and the error message
    } 
    // If 'minDateStr' is provided in the query parameters
    else if (minDateStr) {
        // Call the 'getItemsByMinDate' function from 'myModule'
        // This function returns a Promise that resolves with the items that have a postDate greater than or equal to 'minDateStr'
        myModule.getItemsByMinDate(minDateStr)
        .then(items => res.render("items", {items: items})) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.render("items", {message: "No results found."})); // If the Promise rejects, send a 500 status code and the error message
    } 
    // If neither 'category' nor 'minDateStr' is provided in the query parameters
    else {
        // Call the 'getAllItems' function from 'myModule'
        // This function returns a Promise that resolves with all items
        myModule.getAllItems()
        .then(items => res.render("items", {items: items})) // If the Promise resolves, send the items as a JSON response
        .catch(err => res.render("items", {message: "No results found."})); // If the Promise rejects, send a 500 status code and the error message
    }
});

// Define a route for GET requests to '/items/add'
app.get('/items/add', (req, res) => {
    // Send the 'addItem.html' file as a response
    res.render('addItem');
    // res.sendFile(path.join(__dirname, '/views/addItem.html'));
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
        .then(categories => res.render("categories", {categories: categories}))
        .catch(err => res.render("categories",{message: "no results"}));
});

// Define a middleware function that sends a 404 page for any unhandled routes
app.use((req, res, next) => {
    res.render('404');
    // res.sendFile(path.join(__dirname, '/views/404.html'));
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