const express=require("express")
const app=express()
const dotenv=require("dotenv").config()
const connectDB=require("./config/connectionDB")
const cors=require("cors")

const PORT=process.env.PORT || 3000
connectDB()
app.use(express.json())
app.use(cors())
app.use(express.static("public"))

app.use("/",require("./routes/user"))
app.use("/recipe",require("./routes/recipe"));

app.get("/",(req,res)=>{
    res.json({message:"hello"})
})
app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  next();
});
app.listen(PORT,(err)=>{
    if(err){
        console.log(`error hogya`)
    }
    else{

        console.log(`port running ${PORT}`)
    }
})
