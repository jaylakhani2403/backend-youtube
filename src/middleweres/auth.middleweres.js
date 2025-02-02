import jwt from "jsonwebtoken";
import {asynchandelar} from "../utils/asyncHendelar.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from '../models/user.model.js'

export const verifyJWT= asynchandelar(async(req,res,next)=>{
    try {
        // console.log(req.cookies)
        const token=req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","");
        // console.log(token)
        if(!token){
            throw new ApiError(401,"unauthorization error")
    
        }
        const decodeToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    // console.log(decodeToken)
     const user=   await User.findById(decodeToken?._id).select(
        "-password -refreshToken"
    )
    // console.log("user!!!",user)
    
        if(!user){
            throw new ApiError(401,"invalide acces token");
            
        }
    
        req.user=user;
        // console.log("user activation ", req.user)
        next()
    } catch (error) {
        throw new  ApiError(401,error?.messsage || "invalide token Acess!");
        
        
    }

})
