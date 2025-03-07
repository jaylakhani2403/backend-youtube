import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";





const userSchema=new Schema({

    username:{
        type:String,
        required:true,
        lowecase:true,
        trim:true,
        index:true,

    },
      email :{
        type:String,
        required:true,
        lowecase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },

    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,

    },
    whatHistry:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
        }

    ],
    password:{
        type:String,
        required:[true,'passeword requried'],

        },
     refreshToken:{
            type:String,


        },
    role:{
            type:String,
            enum:["user","admin"],
            default:"user",
            },




},{timestamps:true});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// import bcrypt from 'bcryptjs';

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken=function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefToken=function(){
  return   jwt.sign(
        {
            _id:this._id,
           


        },
        
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )

}
export  const User=mongoose.model("User",userSchema)