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
                            // console.log("IS false");
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

          // Get the current date
          let currentDate = new Date();
          let year = currentDate.getFullYear();
          let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
          let day = ("0" + currentDate.getDate()).slice(-2);

          // Concatinate the variables
          itemData.postDate = `${year}-${month}-${day}`;

          console.log("The current data is ", itemData.postDate)

          // Explicitly set the id property of itemData to be the length of the "items" array plus one (1)
          itemData.id = items.length + 1;
      
          // Push the updated ItemData object onto the "items" array
          items.push(itemData);

          const fs = require('fs');

        //   console.log("The id:",itemData.id);
        //   console.log("The title:",itemData.title);
        //   console.log("The postDate:",itemData.postDate);
        //   console.log("The price", itemData.price);
        //   console.log("The category:", itemData.category);
        //   console.log("The published:", itemData.published);
            
            // Create the format of the json
            let data = {
                "id":itemData.id,
                "category":itemData.category,
                "postDate":itemData.postDate,
                "featureImage":"https://dummyimage.com/200x200/000/fff",
                "price":itemData.price,
                "title":itemData.title,
                "body":itemData.body,
                "published":itemData.published
            };

            // Add new json to the "items.json" file  
            fs.readFile('data/items.json', 'utf8', function readFileCallback(err, fileData){
                if (err){
                    console.log(err);
                } else {
                obj = JSON.parse(fileData); // Convert file data to JSON
                obj.push(data); // Add new data to the JSON object
                json = JSON.stringify(obj, null, 2); // Convert updated JSON object back to a string
                fs.writeFile('data/items.json', json, 'utf8', callback); // Write the updated JSON string back to the file
            }});
            
            function callback(err) {
                // If the 'err' parameter is truthy (i.e., an error occurred), throw the error.
                if (err) throw err;
                // If no error occurred (i.e., 'err' is falsy), log the message 'The file has been saved!' to the console.
                console.log('The file has been saved!');
            }                      
      
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

    // Define a function to get published items by category
    getPublishedItemsByCategory : function(category) {
        // Return a new Promise
        return new Promise((resolve, reject) => {
            // Read the file "data/items.json"
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
                    // Initialize an array to store the published items
                    let publishedItems = [];
                    // Iterate over each item in the data
                    data.forEach(item => {
                        // If the item is published and its category matches the given category, log the item and add it to the array
                        if (item.published == true && item.category == category) {
                            console.log(item);
                            publishedItems.push(item);
                        }
                        else {
                            // If the item is not published or its category does not match, do nothing
                            // console.log("IS false");
                        }
                    });
                    // If there are any published items, resolve the Promise with the items
                    if (publishedItems.length > 0) {
                        resolve(publishedItems);
                    } else {
                        // If there are no published items, reject the Promise with a message
                        reject("No published items found");
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