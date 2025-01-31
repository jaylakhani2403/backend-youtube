import { asynchandelar } from "../utils/asyncHendelar.js"

const registerUser=asynchandelar(async(req,res)=>{
    res.status(200).json({
        message:"User Registered Successfully",
    })
})

export {registerUser}