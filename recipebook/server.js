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
const app = express();
const port = 80;

// DB stuff
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
  recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
});

var User = mongoose.model("User", UserSchema);

// Session will be added when a user successfully logged in.
let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = { id: sid, time: now };
  return sid;
}

function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if (last + 600000 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);

app.use(cookieParser());

function authenticate(req, res, next) {
  /**
   * Description: This function is responsible for authenticating
   * a user based on its cookie information
   *
   * Parameters:
   * req = Request
   * res = Response
   * next = Next middleware function
   *
   * Return: None
   */
  let c = req.cookies;
  console.log("auth request:");
  console.log(req.cookies);
  if (c != undefined && c.login != undefined) {
    if (
      sessions[c.login.username] != undefined &&
      sessions[c.login.username].id == c.login.sessionID
    ) {
      next();
    } else {
      res.clearCookie("login");
      res.redirect("/signin.html");
    }
  } else {
    res.redirect("/signin.html");
  }
}

app.use(express.static("public_html"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bp.json());

// /get/users/ (GET) Should return a JSON array containing the information for every user in the database.
app.get("/get/users/", (req, res) => {
  User.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.status(500).send({ error: "Failed to fetch users" });
    });
});

// /get/recipes to get all recipes from the database.
app.get("/get/recipes", (req, res) => {
  Recipe.find({})
    .then((recipes) => res.json(recipes))
    .catch((err) => res.status(500).send({ error: "Failed to fetch recipes" }));
});

// /get/recipe/:user to get all recipes from a user
app.get("/get/recipe/:user", (req, res) => {
  User.findOne({ username: req.params.user })
    .populate("recipes")
    .then((user) => res.json(user.recipes))
    .catch((err) =>
      res.status(500).send({ error: "Failed to fetch user recipes" })
    );
});

// /search/recipe/:keyword to look for all recipes that have the keyword in their title.
app.get("/search/recipe/:keyword", (req, res) => {
  Recipe.find({ title: { $regex: req.params.keyword, $options: "i" } })
    .then((recipes) => res.json(recipes))
    .catch((err) =>
      res.status(500).send({ error: "Failed to search recipes" })
    );
});

// /add/user/ (POST) Should add a user to the database. The username and password should be sent as POST parameter(s).
app.post("/add/user/", async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided.
  if (!username || !password) {
    return res
      .status(400)
      .send({ error: "Both username and password are required" });
  }
  // Create a new user instance
  const newUser = new User({
    username,
    password,
    recipes: [],
  });

  try {
    const savedUser = await newUser.save();
    res
      .status(201)
      .send({ message: "User added successfully", userId: savedUser._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({ error: "Username already exists" });
    }
    return res.status(500).send({ error: "Failed to add user" });
  }
});

/*
    Post request to log in a user 
*/
app.post("/account/login", (req, res) => {
  console.log(sessions);
  let u = req.body;
  let p1 = User.find({ username: u.username, password: u.password }).exec();
  p1.then((results) => {
    if (results.length == 0) {
      res.end("Coult not find account");
    } else {
      let sid = addSession(u.username);
      res.cookie("login", { username: u.username, sessionID: sid });
      res.end("SUCCESS");
    }
  });
});

// /add/recipe/:username add a recipe to an associated user.
app.post("/add/recipe/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    user.recipes.push(savedRecipe._id);
    await user.save();

    res.status(201).send({ message: "Recipe added successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to add recipe" });
  }
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

module.exports = { User, Recipe }; // Used only for seeding DB