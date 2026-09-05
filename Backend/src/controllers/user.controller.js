import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { deleteFile, uploadFile } from "../utils/cloudinaryService.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// generating tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });

        return {accessToken , refreshToken};
        
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating access and refresh token.");
    }
}

// register controller
const registerUser = AsyncHandler( async (req , res , next) => {
    const {username , email , password , fullname} = req.body;

    if ([username , email , password , fullname].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "All field are required.")
    }

    const existingUser = await User.findOne({
        $or : [{username} , {email}]
    })

    if (existingUser) {
        throw new ApiError(409 , "User already exists.")
    }

    const avatarPath = req.files?.avatar[0]?.path;
    // const coverImgPath = req.files?.coverImg[0]?.path;

    let coverImgPath;

    if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
        coverImgPath = req.files.coverImg[0].path;
    }

    if (!avatarPath) {
        throw new ApiError(400 , "Avatar is required.")
    }

    const avatar = await uploadFile(avatarPath);
    const coverImg = await uploadFile(coverImgPath);

    if (!avatar) {
        throw new ApiError(400 , "Avatar is required.")
    }

    const user = await User.create({
        fullname,
        avatar : {
            url : avatar?.secure_url,
            public_id : avatar?.public_id
        },

        coverImg : {
            url : coverImg?.secure_url,
            public_id : coverImg?.public_id
        },

        email,
        password,
        username : username.toLowerCase()
    })

    const checkUser = await User.findById(user._id).select(
        "-refreshToken"
    )

    if(!checkUser) {
        throw new ApiError(500 , "Something went wrong while registering user.")
    }

    return res.status(201).json(
        new ApiResponse(200 , checkUser , "User registered successfully.")
    )

})

// login controller
const loginUser = AsyncHandler(async (req , res) => {
    const {email , password} = req.body;

    if ([email , password].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "All field are required.")
    }

    const user = await User.findOne({email}).select("+password");

    if (!user) {
        throw new ApiError(404 , "User doesnot exist.")
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401 , "Invalid credentials.")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    // const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const loggedInUser = {
        _id : user._id,
        username : user.username,
        email : user.email,
        fullname : user.fullname,
        avatar : user.avatar,
        coverImg : user.coverImg
    }

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200 , {
            accessToken,
            loggedInUser
        } , "Logged In successfully.")
    )
})

// logout controller
const logoutUser = AsyncHandler(async (req , res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(
        userId , {
            $set : {refreshToken : undefined}
        }, 
        {
            returnDocument: 'after'
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 , "User logged out successfully."))
})

// controller for updating access token
const refreshAccessToken = AsyncHandler( async (req , res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401 , "Invalid refresh token.")
    }

    try {
        const decode = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decode?._id);
    
        if (!user) {
            throw new ApiError(401 , "Invalid refresh token.")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401 , "Refresh token invalid or already used.")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
       const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
       return res
            .status(200)
            .cookie('accessToken' , accessToken , options)
            .json(
                new ApiResponse(200 , {accessToken}) , "Access token refreshed."
            )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token.")
    }
})

// controller for updating password
const changeCurrentPassword = AsyncHandler( async (req , res) => {
    const {currentPassword , newPassword , confirmPassword} = req.body;

    if([currentPassword , newPassword , confirmPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "All fields are required.")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400 , "Password didnot match.")
    }

    const user = await User.findById(req.user?._id).select("+password");

    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400 , "Inavlid password.")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false});

    return res.status(200).json(
        new ApiResponse(200 , "Password changed successfully.")
    )
})

// controller for fetching current user
const getCurrentUser = AsyncHandler( async (req , res) => {
    return res.status(200).json(
        new ApiResponse(200 , req.user , "Current user fetched.")
    )
})

// controller for updating avatar
const updateAvatar = AsyncHandler( async (req , res) => {
    const avatarLocalpath = req.file?.path;

    if (!avatarLocalpath) {
        throw new ApiError(400 , "Avatar path not found.")
    }

    const user = await findById(req.user?._id);

    if (!user) {
        throw new ApiError(404 , "User not found.")
    }

    const prevAvatarPublicId = user.avatar?.public_id;

    const updatedAvatar = await uploadFile(avatarLocalpath);

    if (!updatedAvatar) {
        throw new ApiError(400 , "Error while uploading avatar.")
    }

    await findByIdAndUpdate(req.user?._id, 
        {
            $set : {
                avatar : {
                    url : updatedAvatar?.secure_url,
                    public_id : updatedAvatar?.public_id
                }
            }
        },

        {
            returnDocument : "after"
        }
    )

    if (prevAvatarPublicId) {
        await deleteFile(prevAvatarPublicId)
    }

    return res.status(200).json(
        new ApiResponse(200 , updatedAvatar.url , "Avatar updated successfully.")
    )
})

// controller for updating cover image
const updateCoverImg = AsyncHandler( async (req , res) => {
    const coverImgLocalPath = req.file?.path;

    if (!coverImgLocalPath) {
        throw new ApiError(400 , "Cover image path not found.")
    }

    const user = await findById(req.user?._id);

    if (!user) {
        throw new ApiError(404 , "User not found.")
    }

    const prevCoverImgPublicId = user.coverImg?.public_id

    const updateCoverImg = await uploadFile(coverImgLocalPath);

    if (!updateCoverImg) {
        throw new ApiError(400 , "Error while updating cover image.")
    }

    await findByIdAndUpdate(req.user?._id ,
        {
            $set : {
                coverImg : {
                    url : updateCoverImg?.secure_url,
                    public_id : updateCoverImg?.public_id
                }
            }
        },

        {
            returnDocument : "after"
        }
    )

    if (prevCoverImgPublicId) {
        await deleteFile(prevCoverImgPublicId)
    }

    return res.status(200).json(
        new ApiResponse(200 , updateCoverImg?.url , "Cover image updated successfully")
    )
})

const getCurrentUserProfile = AsyncHandler( async (req , res) => {
    const {username} = req.params;

    if (!username) {
        throw new ApiError(400 , "username not found.")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },

        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },

        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "Subscribed"
            }
        },

        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsSubscribedToCount : {
                    $size : "$subscribed"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.users?._id , "$subscribed.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },

        {
            $project : {
                fullname : 1,
                username : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImg : 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404 , "Channel not found")
    }

    console.log(channel)

    return res.status(200).json(
        new ApiResponse(200 , channel[0] , "User channel fetched successfully.")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAvatar,
    updateCoverImg,
    getCurrentUserProfile
}