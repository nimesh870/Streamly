import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadFile } from "../utils/cloudinaryService.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = AsyncHandler( async (req , res) => {
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
    const coverImgPath = req.files.coverImg[0]?.path;

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
        avatar : avatar.url,
        coverImg : coverImg?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const checkUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!checkUser) {
        throw new ApiError(500 , "Something went wrong while  registering user.")
    }

    return res.status(201).json(
        new ApiResponse(200 , checkUser , "User registered successfully.")
    )

})

const loginUser = AsyncHandler(async (req , res) => {
    const {email , password} = req.body;

    if ([email , password].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "All field are required.")
    }

    const user = await User.findOne({email});

    if (!user) {
        throw new ApiError(404 , "User doesnot exist.")
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401 , "Invalid credentials.")
    }
    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return res.status(200).json(
        new ApiResponse(200 , accessToken , refreshToken , "Login successful.")
    )

})

export {registerUser , loginUser}