import mongoose ,{Schema} from "mongoose";

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

    avtar:{
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
        required:[true,'passeord requried'],

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

export  const User=mongoose.model("User",userSchema)