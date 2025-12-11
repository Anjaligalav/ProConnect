import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import { v2 as cloudinary } from 'cloudinary'; 

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const app = express();

app.use(cors());

app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);

// app.use(express.static("uploads"));

app.use((err, req, res, next) => {
    console.log("Error:", err.message); 
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({ message: message });
});

const start = async() =>{
    const connectDB = await mongoose.connect(process.env.mongodbURL)
    app.listen(9090 ,()=>{
        console.log("Mongodb Connect")
        console.log("server is running on port 9090")
    })
}

start();