import mongoose from "mongoose";

export function connectDB(){
    mongoose.connect("mongodb://127.0.0.1:27017/saraha-app").then(()=>{
        console.log("DB connected 100%");
    }).catch((err)=>{
        console.log("fail to connect to DB");
    })

}