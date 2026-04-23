import express from "express"
import { connectDB } from "./DB/connection.js";
import {authRouter, userRouter} from "./modules/index.js";
import cors from "cors";
import { connectRedis } from "./DB/models/redis.connection.js";
const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();
// Connect to Redis
connectRedis();
// IF you want to allow requests from a specific origin, you can use the following code:
// app.use(cors({
//   origin: 'http://example.com', // Replace with your allowed origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//   allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
// }));

// In development, you might want to allow requests from any origin, which can be done using the following code:
app.use(cors("*"));
// access uploads folder statically by middleware to access images from browser
app.use("/uploads", express.static("uploads"));
// paresing data from req 
app.use(express.json());

// routing
app.use("/auth", authRouter);

app.use("/user", userRouter);
// global error handler
app.use((err , req , res , next)=>{
    if(err.message === "jwt expired"){
err.message = "Token expired, please login again";
return res.status(err.cause||500).json({ success: false, error: err.message });
    }
    return res.status(err.cause||500).json({ success: false, error: err.message});
});
app.listen(port , ()=> {
    console.log("App is runing on port ", port);
})