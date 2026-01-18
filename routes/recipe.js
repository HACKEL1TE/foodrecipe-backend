const express = require("express");
const router = express.Router();
const {
  getRecipe,
  getRecipes,
  addRecipe,
  editRecipe,
  deleteRecipe,
  toggleLike,
  addReview,
  deleteReview,
  upload
} = require("../controller/recipe");
const verifyToken = require("../middleware/auth");

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", verifyToken, upload.single("coverimage"), addRecipe);
router.put("/:id", verifyToken, upload.single("coverimage"), editRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

// Like route
router.post("/:id/like", verifyToken, toggleLike);

// Review routes
router.post("/:id/review", verifyToken, addReview);
router.delete("/:id/review/:reviewId", verifyToken, deleteReview);

module.exports = router;