import { Schema } from "mongoose";
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile: {
        type: String,
        required: true
    },
    thumNail: {
        type: String,
        required: true
    },
    titel: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
     isPublished: {
        type: Number,
        default: 0
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User', 
    }




},

    {
        timestamps: true
    })

    videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("video", videoSchema)