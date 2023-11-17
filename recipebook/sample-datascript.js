const mongoose = require('mongoose');
const { User, Recipe } = require('./models'); // Import your User and Recipe models

const mongoDBURL = "mongodb://127.0.0.1/recipes"; // Your database URL
mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });

const addSampleData = async () => {
  try {
    // Insert sample recipes
    const insertedRecipes = await Recipe.insertMany(recipes);

    // Update sample users with recipe IDs (if needed)
    users.forEach(user => {
      user.recipes = insertedRecipes.map(recipe => recipe._id); // Assuming each user has all recipes
    });

    // Insert sample users
    await User.insertMany(users);

    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    mongoose.disconnect();
  }
};

addSampleData();
