import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";

const createTweet = AsyncHandler( async (req , res) => {
    const { content } = req.body;

    if (typeof content !== "string" || content?.trim() === "") {
        throw new ApiError(400 , "Content is required.")
    }

    if (!req.user?._id) {
        throw new ApiError(404 , "No authenticated user found.")
    }

    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    if (!tweet) {
        throw new ApiError(400 , "Error while creating tweet.")
    }

    return res.status(201).json(
        new ApiResponse(201 , tweet , "Tweet created successfully.")
    )
})

export {
    createTweet
}