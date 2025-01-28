// require('dotenv').config({path:'./env'})
import dotenv from "dotenv" 
import mongoose from "mongoose";

import connectDB from "./db/index.js";

dotenv.config({
  path: './.env'
})
try{
connectDB()
}
catch(err){
  console.log("index.js in error",err)
  }






/*
import express from "express";
const app=express();

(async()=>{
    try{
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error    ! index.js!",error);
        throw error
      })

      app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`);
      })
    }
    catch(error){
        console.error("error!:",error);
    }
})()
*/