const Sequelize = require('sequelize');

// Destructure environment variables for database connection
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env;

// Initialize Sequelize with database credentials and options
var sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false } // Use SSL with self-signed certificates
    },
    query: { raw: true } // Return raw data without Sequelize metadata
});

// Define the Item model with its attributes
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
});

// Define the Category model with its attributes
const Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

// Establish a relationship between Item and Category models
Item.belongsTo(Category, {foreignKey: 'category'});

// Export an object containing several functions
module.exports = {

    // The 'initialize' function reads data from JSON files and stores it in the 'items' and 'categories' arrays
    initialize : function() {
      return new Promise((resolve, reject) => {
          // Synchronizing the models with the database
          sequelize.sync({ force: true })
              .then(() => {
                  // If synchronization is successful, log a message and resolve the promise
                  console.log('All models were synchronized successfully.');
                  resolve();
              })
              .catch((error) => {
                  // If there is an error during synchronization, log the error and reject the promise
                  console.error('Unable to synchronize the models:', error);
                  reject("unable to sync the database");
              });
      });
    },  

    // The 'getAllItems' function returns a Promise that resolves with all items, or rejects if there are no items
    getAllItems : function() {
      return new Promise((resolve, reject) => {
          // Fetching all items from the database
          Item.findAll()
              .then(items => {
                  // If items are found, resolve the promise with the items
                  if (items.length > 0) {
                      resolve(items);
                  } else {
                      // If no items are found, reject the promise with a message
                      reject('no results returned');
                  }
              })
              .catch(error => {
                  // If there is an error during the fetch, reject the promise with a message
                  reject('no results returned');
              });
      });
    },

    // The 'getPublishedItems' function returns a Promise that resolves with all published items, or rejects if there are no published items
    getPublishedItems: function() {
      return new Promise((resolve, reject) => {
          // Fetching all items from the database where the 'published' field is true
          Item.findAll({
              where: {
                  published: true
              }
          })
          .then(items => {
              // Log the retrieved published items
              console.log('Published items:', items);
              // Resolve the promise with the retrieved items
              resolve(items);
          })
          .catch(error => {
              // Log any error that occurs during the fetch
              console.error('Error retrieving published items:', error);
              // Reject the promise with a message if an error occurs
              reject("no results returned");
          });
      });
    },

    // The 'getCategories' function returns a Promise that resolves with all categories, or rejects if there are no categories
    getCategories : function() {
      return new Promise((resolve, reject) => {
        // Fetching all categories from the database
        Category.findAll()
          .then(categories => {
            // If categories are found, resolve the promise with the categories
            if (categories.length > 0) {
              resolve(categories);
            } else {
              // If no categories are found, reject the promise with a message
              reject("no results returned");
            }
          })
          .catch(error => {
            // If there is an error during the fetch, reject the promise with a message
            reject("no results returned");
          });
      });
    },

    // Adds item 
    addItem: function(itemData) {
      return new Promise((resolve, reject) => {
          // Ensure the published property is set correctly
          // itemData.published = (itemData.published === 'true'); // Convert to boolean
          if (Item.published == "") {
            // If the published property is an empty string, set it to true
            Item.published = true;
          } else {
            // Otherwise, set it to false
            Item.published = false;
          }
          // Log the current value of the published property
          console.log("The published is:", Item.published);
  
          // Replace any blank values in itemData with null
          for (let key in itemData) {
              if (itemData[key] === "") {
                  itemData[key] = null;
              }
          }
  
          // Set the postDate to the current date
          itemData.postDate = new Date();
  
          // Create the item in the database
          Item.create(itemData)
              .then(item => {
                  // Resolve the promise with the created item
                  resolve(item);
              })
              .catch(error => {
                  // If there is an error during creation, reject the promise with a message
                  reject("unable to create post");
              });
      });
    },  

    // Function to get items by category
    getItemsByCategory : function(category) {
      // Return a new Promise
      return new Promise((resolve, reject) => {
          // Fetching all items from the database where the category matches the provided category
          Item.findAll({ where: { category } })
              .then(items => {
                  // If items are found, resolve the promise with the items
                  if (items.length > 0) {
                      resolve(items);
                  } else {
                      // If no items are found, reject the promise with a message
                      reject('no results returned');
                  }
              })
              .catch(error => {
                  // If there is an error during the fetch, reject the promise with a message
                  reject('no results returned');
              });
      });
    },

    // Define a function to get published items by category
    getPublishedItemsByCategory: function(category) {
      // Return a new Promise
      return new Promise((resolve, reject) => {
        // Fetching all items from the database where the 'published' field is true and the category matches the provided category
        Item.findAll({
          where: {
            published: true,
            category: category
          }
        })
        .then(items => {
          // If items are found, resolve the promise with the items
          if (items.length > 0) {
            resolve(items);
          } else {
            // If no items are found, reject the promise with a message
            reject("no results returned");
          }
        })
        .catch(error => {
          // Log any error that occurs during the fetch
          console.error('Error retrieving published items:', error);
          // Reject the promise with a message if an error occurs
          reject("no results returned");
        });
      });
    },

    // Function to get items by minimum date
    getItemsByMinDate: function(minDateStr) {
      // Return a new Promise
      return new Promise((resolve, reject) => {
        // Destructure the 'gte' (greater than or equal to) operator from Sequelize.Op
        const { gte } = Sequelize.Op;
        // Fetching all items from the database where the postDate is greater than or equal to the provided minDateStr
        Item.findAll({
          where: {
            postDate: {
              [gte]: new Date(minDateStr)
            }
          }
        })
        .then(items => {
          // If items are found, resolve the promise with the items
          if (items.length > 0) {
            resolve(items);
          } else {
            // If no items are found, reject the promise with a message
            reject("no results returned");
          }
        })
        .catch(error => {
          // If there is an error during the fetch, reject the promise with a message
          reject("no results returned");
        });
      });
    },    

    // Function to get an item by its ID
    getItemById: function(id) {
      // Return a new Promise
      return new Promise((resolve, reject) => {
          // Find all items with the specified id
          Item.findAll({ where: { id: id } })
              .then(items => {
                  // If items are found, resolve the promise with the first item
                  if (items.length > 0) {
                      resolve(items[0]);
                  } else {
                      // If no items are found, reject the promise with a message
                      reject('No results returned');
                  }
              })
              .catch(error => {
                  // If there is an error during the fetch, reject the promise with an error message
                  reject('Error occurred: ' + error.message);
              });
      });
    },

    // Adds category 
    addCategory : function(categoryData) {
      return new Promise((resolve, reject) => {
        // Ensure the published property is set correctly
        categoryData.published = (Category.published) ? true : false;
  
        // Replace any blank values in categoryData with null
        for (let key in categoryData) {
            if (categoryData[key] === "") {
              categoryData[key] = null;
            }
        }
  
        // Set the postDate to the current date
        categoryData.postDate = new Date();
    
        // Create the category in the database
        Category.create(categoryData)
            .then(category => {
                // Resolve the promise with the created category
                resolve(category);
            })
            .catch(error => {
                // If there is an error during creation, reject the promise with a message
                reject("unable to create category");
            });
        });
    },

    // Deletes category by Id
    deleteCategoryById : function(id) {
      return new Promise((resolve, reject) => {
        // Delete the category from the database where the id matches the provided id
        Category.destroy({
          where: { id: id }
        })
        .then(deleted => {
            // If a category was deleted, resolve the promise
            if (deleted) {
                resolve();
            } else {
                // If no category was deleted, reject the promise with a message
                reject('Reject');
            }
        })
        .catch(err => {
            // If there is an error during deletion, reject the promise with a message
            reject('Unable to remove post');
        });
      })
    },

    // Deletes post by Id
    deletePostById : function(id) {
      return new Promise((resolve, reject) => {
          // Delete the item from the database where the id matches the provided id
          Item.destroy({
              where: { id: id }
          })
          .then(deleted => {
              // If an item was deleted, resolve the promise
              if (deleted) {
                  resolve();
              } else {
                  // If no item was deleted, reject the promise with a message
                  reject('Post not found');
              }
          })
          .catch(err => {
              // If there is an error during deletion, reject the promise with a message
              reject('Unable to remove post');
          });
      });
    }  
};