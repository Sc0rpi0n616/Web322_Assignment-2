// Import the mongoose and bcryptjs modules
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a new mongoose Schema object
let Schema = mongoose.Schema;

// Define the user schema with fields for userName, password, email, and loginHistory
let userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String,
    }],
});

// Create a User model using the userSchema
let User = mongoose.model('User', userSchema);

module.exports = {
    // Initializing the Mongo DM database
    initialize : function () {
        return new Promise(function (resolve, reject) {
            const connectionString = "mongodb+srv://vthananchayan:AfbsvIS577CMui1l@cluster0.euaxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
            // Create a connection to the MongoDB database
            let db = mongoose.createConnection(connectionString);

            // Handle connection errors
            db.on('error', (err) => {
                // Reject the promise with the provided error
                reject(err);
            });

            // Handle successful connection
            db.once('open', () => {
                // Define the User model using the userSchema
                User = db.model("users", userSchema);
                // Resolve the promise
                resolve();
            });
        });
    },

    // Creating users that will be stored in the database
    registerUser: function(userData) {
        return new Promise(function (resolve, reject) {
            // Compare plain text passwords
            if (userData.password !== userData.password2) {
                reject("Passwords do not match");
            } else {
                bcrypt.hash(userData.password, 10).then(hash => { // Hash the password using a Salt that was generated using 10 rounds
                    userData.password = hash; // Update the password with the hashed value
                    let newUser = new User(userData);
                    console.log("The hashed password is:", hash);
                    // TODO: Store the resulting "hash" value in the DB
                    newUser.save().then(() => {
                        // everything good
                        console.log("New user saved");
                        resolve();
                    }).catch(err => {
                        // handle duplicate key error
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    });
                })
                // If it catches an error
                .catch(err => {
                    console.log(err); // Show any errors that occurred during the process
                    reject("There was an error encrypting the password");
                });
            }
        });
    },    
    
    // Checking if the users username an password are in the data base by comparing the data the user input
    checkUser: function(userData) {
        return new Promise(function (resolve, reject) {
            // Find the user by userName
            User.findOne({ userName: userData.userName }).then(user => {
                if (!user) {
                    console.log("User not found");
                    reject("Unable to find user: " + userData.userName);
                } else {
                    console.log("User found");
                    // User found, check password using bcrypt.compare
                    bcrypt.compare(userData.password, user.password).then((result) => {
                        console.log("Users inputted password:", userData.password);
                        console.log("Users database password:", user.password);
                        if (!result) {
                            // Password does not match
                            reject("Incorrect Password for user: " + userData.userName);
                        } else {
                            // Ensure loginHistory is an array
                            if (!Array.isArray(user.loginHistory)) {
                                user.loginHistory = [];
                            }
    
                            // Password matches, update login history
                            user.loginHistory.push({
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            });
    
                            // Update the user with the new login history
                            User.updateOne(
                                { userName: user.userName },
                                { $set: { loginHistory: user.loginHistory } }
                            ).then(() => {
                                // Update successful, resolve with user object
                                resolve(user);
                            }).catch(err => {
                                // Error updating login history
                                reject("There was an error verifying the user: " + err);
                            });
                        }
                    }).catch(err => {
                        // Error comparing passwords
                        reject("There was an error comparing passwords: " + err);
                    });
                }
            }).catch(err => {
                // Error finding user
                console.error("Error finding user:", err);
                reject("Unable to find user: " + userData.userName);
            });
        });
    }                    
}