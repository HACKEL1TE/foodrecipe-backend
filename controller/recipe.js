// Recipe Controller - recipe.js

const Recipe = require("../models/recipe");
const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("createdBy", "name email");
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipes", error: error.message });
  }
};

// Get single recipe
const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "name email");
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipe", error: error.message });
  }
};

// Add recipe
const addRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, time } = req.body;
    
    const newRecipe = new Recipe({
      title,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(","),
      instructions,
      time,
      coverimage: req.file ? req.file.filename : "",
      createdBy: req.user.id
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe created successfully", recipe: newRecipe });
  } catch (error) {
    res.status(500).json({ message: "Error creating recipe", error: error.message });
  }
};

// Edit recipe
const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user is the creator
    if (recipe.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this recipe" });
    }

    const { title, ingredients, instructions, time } = req.body;
    
    recipe.title = title || recipe.title;
    recipe.ingredients = ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split(",")) : recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    recipe.time = time || recipe.time;
    
    if (req.file) {
      recipe.coverimage = req.file.filename;
    }

    await recipe.save();
    res.status(200).json({ message: "Recipe updated successfully", recipe });
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe", error: error.message });
  }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user is the creator
    if (recipe.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this recipe" });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe", error: error.message });
  }
};

// Toggle Like - FIXED VERSION
const toggleLike = async (req, res) => {
  try {
    console.log("=== TOGGLE LIKE CALLED ===");
    console.log("Recipe ID:", req.params.id);
    console.log("User ID:", req.user.id);
    
    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "name email");
    
    if (!recipe) {
      console.log("Recipe not found");
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already liked
    const userIdString = req.user.id.toString();
    const likedIndex = recipe.likes.findIndex(id => id.toString() === userIdString);
    
    if (likedIndex > -1) {
      // Unlike - remove user from likes
      recipe.likes.splice(likedIndex, 1);
      console.log("Recipe unliked");
    } else {
      // Like - add user to likes
      recipe.likes.push(req.user.id);
      console.log("Recipe liked");
    }

    // Save without validation on createdBy (it's already set)
    await recipe.save({ validateModifiedOnly: true });
    
    console.log("Like toggled successfully. Total likes:", recipe.likes.length);
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};

// Add Review - FIXED VERSION
const addReview = async (req, res) => {
  try {
    console.log("=== ADD REVIEW CALLED ===");
    console.log("Recipe ID:", req.params.id);
    console.log("User:", req.user);
    console.log("Review data:", req.body);
    
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "name email");
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already reviewed
    const existingReview = recipe.reviews.find(
      review => review.userId.toString() === req.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this recipe" });
    }

    // Add new review
    const newReview = {
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim()
    };

    recipe.reviews.push(newReview);
    await recipe.save({ validateModifiedOnly: true });
    
    console.log("Review added successfully");
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review", error: error.message });
  }
};

// Delete Review - FIXED VERSION
const deleteReview = async (req, res) => {
  try {
    console.log("=== DELETE REVIEW CALLED ===");
    console.log("Recipe ID:", req.params.id);
    console.log("Review ID:", req.params.reviewId);
    console.log("User ID:", req.user.id);
    
    const recipe = await Recipe.findById(req.params.id).populate("createdBy", "name email");
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Find the review
    const review = recipe.reviews.id(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review author
    if (review.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    // Remove the review (Mongoose 6+ syntax)
    recipe.reviews.pull(req.params.reviewId);
    await recipe.save({ validateModifiedOnly: true });
    
    console.log("Review deleted successfully");
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};

module.exports = {
  getRecipe,
  getRecipes,
  addRecipe,
  editRecipe,
  deleteRecipe,
  toggleLike,
  addReview,
  deleteReview,
  upload
};