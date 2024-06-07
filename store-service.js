// Import the 'fs' module for file system operations
const fs = require('fs');

// Declare two arrays to hold the items and categories data
let items = [];
let categories = [];

// Export an object containing several functions
module.exports = {

    // The 'initialize' function reads data from JSON files and stores it in the 'items' and 'categories' arrays
    initialize : function() {
        return new Promise((resolve, reject) => {
            // Create a Promise to read and parse the items.json file
            const itemsPromise = new Promise((resolve, reject) => {
                fs.readFile('data/items.json', 'utf8', (err, jsonString) => {
                    if (err) {
                        console.log("Error reading file from disk:", err);
                        reject(err);
                        return;
                    }
                    try {
                        items = JSON.parse(jsonString);
                        console.log(items);
                        resolve();
                    } catch(err) {
                        console.log('Error parsing JSON string:', err);
                        reject(err);
                        return;
                    }
                });
            });
    
            // Create a Promise to read and parse the categories.json file
            const categoriesPromise = new Promise((resolve, reject) => {
                fs.readFile('data/categories.json', 'utf8', (err, jsonString) => {
                    if (err) {
                        console.log("Error reading file from disk:", err);
                        reject(err);
                        return;
                    }
                    try {
                        categories = JSON.parse(jsonString);
                        console.log(categories);
                        resolve();
                    } catch(err) {
                        console.log('Error parsing JSON string:', err);
                        reject(err);
                        return;
                    }
                });
            });
    
            // Use Promise.all to wait for both file reading operations to complete
            Promise.all([itemsPromise, categoriesPromise])
                .then(() => {
                    // If both operations were successful, resolve the outer Promise with the items and categories data
                    resolve({items, categories});
                    console.log("Success!!!");
                })
                .catch(err => {
                    // If there was an error, reject the outer Promise with an error message
                    reject("unable to read file");
                });
        });
    },    

    // The 'getAllItems' function returns a Promise that resolves with all items, or rejects if there are no items
    getAllItems : function() {
        return new Promise((resolve, reject) => {
            if (items.length == 0) {
                reject("no results returned");
            } else {
                resolve(items);
            }
        });
    },

    // The 'getPublishedItems' function returns a Promise that resolves with all published items, or rejects if there are no published items
    getPublishedItems : function() {
        return new Promise((resolve, reject) => {
            fs.readFile("data/items.json", 'utf8', (err, jsonString) => {
                if (err) {
                    console.log("Error reading file from disk:", err);
                    reject("Error reading file from disk");
                    return;
                }
                try {
                    const data = JSON.parse(jsonString);
                    let publishedItems = [];
                    data.forEach(item => {
                        if (item.published == true) {
                            console.log(item);
                            publishedItems.push(item);
                        }
                        else {
                            console.log("IS false");
                        }
                    });
                    if (publishedItems.length > 0) {
                        resolve(publishedItems);
                    } else {
                        reject("No published items found");
                    }
                } catch(err) {
                    console.log('Error parsing JSON string:', err);
                    reject("Error parsing JSON string");
                }
            });
        });
    },    

    // The 'getCategories' function returns a Promise that resolves with all categories, or rejects if there are no categories
    getCategories : function() {
        return new Promise((resolve, reject) => {
            if (categories.length == 0) {
                reject("no results returned");
            } else {
                resolve(categories);
            }
        });
    }
};