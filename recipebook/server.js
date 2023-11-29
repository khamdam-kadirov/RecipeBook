/**
 * Author: Igor, John, Sherali, Khamdam
 * Date: 11/30/2023
 * Class: CSC 337
 * Instructor: Benjamin Dicken
 *
 * Description:
 */

const mongoose = require("mongoose");
const express = require("express");
const bp = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const app = express();
const port = 80;
const saltRounds = 10;

// DB setup
const db = mongoose.connection;
const mongoDBURL = "mongodb://127.0.0.1/recipes";
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
const Schema = mongoose.Schema;
db.on("error", () => {
  console.log("MongoDB connection error:");
});

// Define the recipe schema
const RecipeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

// Define the UserSchema
var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  recipes: [ {type: Schema.Types.ObjectId, ref: "Recipe" } ],
});

var User = mongoose.model("User", UserSchema);


// Middleware for parsing cookies and request bodies
app.use(cookieParser());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Object to hold active sessions with session ID as key
let sessions = {};

// Creates a new user session.
function addSession(usernameString) {
  let sid = Math.floor(Math.random() * 1000000000);
  // Record current time to track session creation time
  let now = Date.now();
  // Create session object and add it to the sessions object
  sessions[sid] = {
    username: usernameString,
    id: sid,
    time: now
  };
  return sid;
}

// Removes expired sessions. Session expiration is set to 10 minutes.
function removeSessions() {
  let now = Date.now();

  // Iterate over all the sessions
  for (let sid in sessions) {
    if (sessions.hasOwnProperty(sid)) {
      let session = sessions[sid];
      // Check if the session has expired
      if (session.time + 600000 < now) {
        // If the session has expired, delete it from the sessions object
        delete sessions[sid];
      }
    }
  }
}

setInterval(removeSessions, 2000);

// This function authenticates the user by checking the session cookie.
function authenticate(req, res, next) {
  // Retrieve the session ID from the cookie
  let sessionCookie = req.cookies['session_id'];

  if (sessionCookie) {
    // Look up the session by the session ID
    let sessionKey = Object.keys(sessions).find(key => sessions[key].id == sessionCookie);
    let session = sessions[sessionKey];

    // Check if session exists and hasn't expired
    if (session && (Date.now() - session.time) < 600000) {
      // Create a session on the request object if it's not already there
      if (!req.session) req.session = {};
      req.session.username = session.username;
      next();
    } else {
      // If session doesn't exist or is expired, delete it and redirect to index
      if (session) {
        delete sessions[sessionKey];
        res.redirect('/index.html');
      } else {
        // If session is not found, redirect to index
        res.redirect('/index.html');
      }
    }
  } else {
    // If no session cookie, redirect to index
    res.redirect('/index.html');
  }
}

// Middleware for serving static files, but with authentication 
//for certain paths
app.use((req, res, next) => {
  // Check if request is for 'home.html'
  if (req.path === '/home.html') {
    // Authenticate before serving these files
    authenticate(req, res, next);
  } else {
    next();
  }
}, express.static('public_html'));


// POST route for handling the login process
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username: username })
    .then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
      }

      // Compare hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          let sid = addSession(username);
          res.cookie('session_id', sid, { maxAge: 1200000, httpOnly: true });
          res.json({ success: true, redirectTo: '/home.html' });
        } else {
          res.status(401).json({ success: false, message: 'Incorrect username or password.' });
        }
      });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'An error occurred during login.' });
    });
});


// POST route for handling the creation of a new account
app.post('/create-account', (req, res) => {
  const { username, password } = req.body;

  // Check if the password meets the minimum length requirement
  if (password.length < 7) {
    return res.status(400).json({ success: false, message: 'Password must be at least 7 characters long.' });
  }

  User.findOne({ username: username })
    .then(existingUser => {
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }

      // Hash the password before saving the user
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error hashing password.' });
        }

        const newUser = new User({ username, password: hash });
        newUser.save()
          .then(() => {
            res.status(201).json({ success: true, message: 'Account created successfully.' });
          })
          .catch(err => {
            res.status(500).json({ success: false, message: 'Error creating new user.' });
          });
      });
    })
    .catch(err => {
      res.status(500).json({ success: false, message: 'Error checking for existing user.' });
    });
});


// GET route to fetch all users from the database.
app.get("/get/users", (req, res) => {
  User.find({})
    .then(users => {
      // Respond with the list of users in JSON format.
      res.json(users);
    })
    .catch(err => {
      // Handle any errors in fetching users.
      res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    });
});

// GET route to fetch all recipes from the database.
app.get("/get/recipes", (req, res) => {
  Recipe.find({})
    .then(recipes => {
      // Respond with the list of recipes in JSON format.
      res.json(recipes);
    })
    .catch(err => {
      // Handle any errors in fetching recipes.
      res.status(500).json({ success: false, message: 'Failed to fetch recipes.' });
    });
});

// GET route to fetch all recipes from a specific user.
app.get("/get/recipe/:user", (req, res) => {
  User.findOne({ username: req.params.user })
    .populate("recipes")
    .then(user => {
      if (!user) {
        // If the user is not found, respond with an error.
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      // Respond with the user's recipes.
      res.json(user.recipes);
    })
    .catch(err => {
      // Handle any errors in fetching user recipes.
      res.status(500).json({ success: false, message: 'Failed to fetch user recipes.' });
    });
});

// GET route to search for recipes by a keyword in their title.
app.get("/search/recipe/:keyword", (req, res) => {
  Recipe.find({ title: { $regex: req.params.keyword, $options: "i" } })
    .then(recipes => {
      // Respond with the matching recipes.
      res.json(recipes);
    })
    .catch(err => {
      // Handle any errors in the search process.
      res.status(500).json({ success: false, message: 'Failed to search recipes.' });
    });
});

// POST route to add a recipe to a specific user.
app.post("/add/recipe/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      // If the user is not found, respond with an error.
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    user.recipes.push(newRecipe._id);
    await user.save();

    // Respond with success message.
    res.status(201).json({ success: true, message: 'Recipe added successfully.' });
  } catch (err) {
    // Handle any errors in adding a recipe.
    res.status(500).json({ success: false, message: 'Failed to add recipe.' });
  }
});


// Logout endpoint in server.js
app.post('/logout', (req, res) => {
  let sessionCookie = req.cookies['session_id'];

  if (sessionCookie && sessions[sessionCookie]) {
      // Delete the session from the server
      delete sessions[sessionCookie];
      // Clear the session cookie
      res.clearCookie('session_id');
      res.json({ success: true, message: 'Logged out successfully.' });
  } else {
      res.status(400).json({ success: false, message: 'Not logged in.' });
  }
});


app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

// Used only for seeding DB
module.exports = { User, Recipe };