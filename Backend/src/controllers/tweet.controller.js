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

const getUserTweet = AsyncHandler( async (req , res) => {

    const userTweets = await Tweet.find({
        owner : req.user._id
    })

    if (!userTweets) {
        throw new ApiError(404 , "No tweets found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , userTweets , "User tweets found.")
    )

})

export {
    createTweet,
    getUserTweet
}