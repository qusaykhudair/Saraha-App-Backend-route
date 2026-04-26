import cors from "cors";
import express from "express"
import helmet from "helmet";
import { connectDB } from "./DB/connection.js";
import {authRouter, messageRouter, userRouter} from "./modules/index.js";

import { connectRedis } from "./DB/models/redis.connection.js";
import rateLimit from "express-rate-limit";
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
app.use(helmet())
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
     statusCode : 500 , 
     legacyHeaders : false,
     keyGenerator:(req , res , next)=>{
        return `${req.ip}:${req.path}`;
     }
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

// paresing data from req 
app.use(express.json());

// routing
app.use("/auth", authRouter);

app.use("/user", userRouter);

app.use("/message", messageRouter);

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