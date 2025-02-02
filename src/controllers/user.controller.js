import { asynchandelar } from "../utils/asyncHendelar.js"
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser=asynchandelar(async(req,res)=>{
  


   const {fullName,email,username,password}= req.body
   console.log("email",email);

   if([
      fullName,email,username,password].some((field)=>field?.trim()==="")){
      throw new ApiError(400,"all fields are required")
      

   }
  const existeduser=await User.findOne({
   $or:[{username},{email}]
  })
  if(existeduser){
   throw new ApiError("already exists username or email");
   
  }

 const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

  if(!avatarLocalPath){
   throw new ApiError(400,"avatar is required local not include");
   
  }

  const avatar=await uploadCloudinary(avatarLocalPath)
  const coverImage=await uploadCloudinary(coverImageLocalPath)

  if(!avatar){
   throw new ApiError(400,"avtar is required");
  }

  const user= await User.create({
   fullName,
   avatar:avatar.url,
   coverImage:coverImage?.url||"",
   email,
   password,
    username: username.toLowerCase()

  })

const cretedUser=   await User.findById(user._id).select(
   "-password -refreshToken"
)

if(!cretedUser){
   throw new ApiError(500,"somthing went wrong register user");

}

return res.status(201).json(
   new ApiResponse(200,cretedUser,"user register succesfully")
)



})

export {registerUser}