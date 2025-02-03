import { asynchandelar } from "../utils/asyncHendelar.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    console.log("user id:", userId)
    try {
        const user = await User.findById(userId);

        // console.log("user :",user)
        const accessToken = user.generateAcessToken();
        // console.log("acess Token",accessToken)
        const refreshToken = user.generateRefToken();
        // console.log("refresh  ",refreshToken)
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asynchandelar(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    const avatarFile = req.files?.avatar?.[0];
    const coverImageFile = req.files?.coverImage?.[0];

    if (!avatarFile) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadCloudinary(avatarFile.buffer, avatarFile.mimetype);
    const coverImage = coverImageFile ? await uploadCloudinary(coverImageFile.buffer, coverImageFile.mimetype) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asynchandelar(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isValidPassword = await user.isPasswordCorrect(password);
    // console.log("password credit",isValidPassword)
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

});

const logoutUser = asynchandelar(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asynchandelar(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asynchandelar(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isValidPassword = await user.isPasswordCorrect(oldPassword)
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "Pass word change succesfully"))

})
const updateAccountDetails = asynchandelar(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const getCurrentUser = asynchandelar(async (req, res) => {
    return res.status(200).json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"))
})


const updateUserAvatar = asynchandelar(async (req, res) => {
    const avatar = await uploadCloudinary(req.files?.path)

    if (!avatar) {
        throw new ApiError(400, "Avatar not uploaded")
    }

    const user = await findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")


    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"))

})
const updateUserCoverImage = asynchandelar(async (req, res) => {
    const coverImage = await uploadCloudinary(req.files?.path)

    if (!avatar) {
        throw new ApiError(400, "coverImage not uploaded")
    }

    const user = await findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")


    return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))

})



const getChennalUserProfile = asynchandelar(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw ApiError(400, "user name is missing")
    }
    await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        }, 
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberTo"

            }

        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscriberTo"
                },
                isSubscribed:{
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscribers"] },
                        then:true,
                        else:false

                    }
                }

            }
        },
        {
            
            $project:{
                fullname:1,
                username:1,
                channelSubscribedToCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1



            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(400,"chenal dose not exist");
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"user chhenal fetch succes fully"))

})
const getWatchHistory=asynchandelar(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }

        },
        {
            $lookup:{
                from:"videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline: [
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1,
                                        fullname:1
                                        }
                                }
                            ]
                        }
                    }
                ]

                }   
                },{
                    $add:
                    {
                        $addFields:{
                            $first:"$owner"
                        }
                    }
                }
    ])

    return res.status(200).json(new ApiResponse(200,user[0].watchhistory,"watch history fetch succesfully"))
})



export {
    registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateAccountDetails,
    updateUserAvatar, updateUserCoverImage, getChennalUserProfile,getWatchHistory
};