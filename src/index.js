import express from "express"
import { connectDB } from "./DB/connection.js";
import {authRouter, userRouter} from "./modules/index.js";
const app = express();
const port = 3000;
connectDB();
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