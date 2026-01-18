const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectionDB");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Logging middleware
app.use((req, res, next) => {
    console.log("Request URL:", req.url);
    next();
});

// Routes
app.use("/", require("./routes/user"));
app.use("/recipe", require("./routes/recipe"));

// Test route
app.get("/", (req, res) => {
    res.json({ message: "hello" });
});

// Connect to MongoDB and then start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });
