// Import the 'fs' module for file system operations
const { rejects } = require('assert');
const fs = require('fs');
const { resolve } = require('path');

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
    },

    addItem : function(itemData) {
        return new Promise((resolve, reject) => {
          // If itemData.published is undefined, explicitly set it to false, otherwise set it to true
          itemData.published = itemData.published === undefined ? false : true;
      
          // Explicitly set the id property of itemData to be the length of the "items" array plus one (1)
          itemData.id = items.length + 1;
      
          // Push the updated ItemData object onto the "items" array
          items.push(itemData);
      
          // Resolve the promise with the updated itemData value (i.e. the newly added store item)
          resolve(itemData);
        });
    },

    // Function to get items by category
getItemsByCategory : function(category) {
    // Return a new Promise
    return new Promise((resolve, reject) => {
        // Read the file 'items.json'
        fs.readFile("data/items.json", 'utf8', (err, jsonString) => {
            // If there is an error reading the file, log the error and reject the Promise
            if (err) {
                console.log("Error reading file from disk:", err);
                reject("Error reading file from disk");
                return;
            }
            try {
                // Parse the JSON string
                const data = JSON.parse(jsonString);
                let publishedItems = [];
                // Iterate over each item in the data
                data.forEach(item => {
                    // If the item's category matches the input category, add it to the publishedItems array
                    if (item.category == category && (category == 1 || category == 2 || category == 3 || category == 4 || category == 5)) {
                        publishedItems.push(item);
                    }
                });
                // If there are any published items, resolve the Promise with the publishedItems
                if (publishedItems.length != 0) {
                    resolve(publishedItems);
                } else {
                    // If there are no published items, reject the Promise with a message
                    reject("no results returned");
                }
            } catch(err) {
                // If there is an error parsing the JSON string, log the error and reject the Promise
                console.log('Error parsing JSON string:', err);
                reject("Error parsing JSON string");
            }
        });
    });
},

// Function to get items by minimum date
getItemsByMinDate : function(minDateStr) {
    // Return a new Promise
    return new Promise((resolve, reject) => {
        // Read the file 'items.json'
        fs.readFile("data/items.json", 'utf8', (err, jsonString) => {
            // If there is an error reading the file, log the error and reject the Promise
            if (err) {
                console.log("Error reading file from disk:", err);
                reject("Error reading file from disk");
                return;
            }
            try {
                // Parse the JSON string
                const data = JSON.parse(jsonString);
                let publishedItems = [];
                // Iterate over each item in the data
                data.forEach(item => {
                    // If the item's postDate is greater than or equal to the input minDateStr, add it to the publishedItems array
                    if (new Date(item.postDate) >= new Date(minDateStr)) {
                        publishedItems.push(item);
                    }
                });
                // If there are any published items, resolve the Promise with the publishedItems
                if (publishedItems.length != 0) {
                    resolve(publishedItems);
                } else {
                    // If there are no published items, reject the Promise with a message
                    reject("no results returned");
                }
            } catch(err) {
                // If there is an error parsing the JSON string, log the error and reject the Promise
                console.log('Error parsing JSON string:', err);
                reject("Error parsing JSON string");
            }
        });
    });
},

// Function to get an item by its ID
getItemById : function(id) {
    // Return a new Promise
    return new Promise((resolve, reject) => {
        // Read the file 'items.json'
        fs.readFile("data/items.json", 'utf8', (err, jsonString) => {
            // If there is an error reading the file, log the error and reject the Promise
            if (err) {
                console.log("Error reading file from disk:", err);
                reject("Error reading file from disk");
                return;
            }
            try {
                // Parse the JSON string
                const data = JSON.parse(jsonString);
                let publishedItems = [];
                // Iterate over each item in the data
                data.forEach(item => {
                    // If the item's ID matches the input ID, add it to the publishedItems array
                    if (item.id == id) {
                        publishedItems.push(item);
                    }
                });
                // If there are any published items, resolve the Promise with the publishedItems
                if (publishedItems.length != 0) {
                    resolve(publishedItems);
                } else {
                    // If there are no published items, reject the Promise with a message
                    reject("no results returned");
                }
            } catch(err) {
                // If there is an error parsing the JSON string, log the error and reject the Promise
                console.log('Error parsing JSON string:', err);
                reject("Error parsing JSON string");
            }
        });
    });
}

};