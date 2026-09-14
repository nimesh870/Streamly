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

const getUserTweetById = AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;

    if (!tweetId || mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")
    }

    const userTweets = await Tweet.findOne({
        _id : tweetId,
        owner : req.user._id
    }).sort({createdAt : -1})

    if (!userTweets) {
        throw new ApiError(404 , "No tweets found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , userTweets , "User tweets found.")
    )

})

const updateTweet = AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;
    const { newContent } = req.body;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")
    }

    if (typeof newContent !== "string" || newContent?.trim() === "") {
        throw new ApiError(400 , "Content is required.")
    }

    const updatedContent = await Tweet.findOneAndUpdate(
        {
            _id : tweetId,
            owner : req.user._id
        },

        {
            $set : {
                content : newContent.trim()
            }
        },

        {
            returnDocument : "after"
        }
    )

    if (!updatedContent) {
        throw new ApiError(404 , "Error occured while updating content.")
    }

    return res.status(200).json(
        new ApiResponse(200 , updatedContent , "Content updated successfully.")
    )
})

const deleteTweet = AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;

    if (!tweetId || mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")
    }

    const deletionOfTweet = await Tweet.findOneAndDelete({
        _id : tweetId,
        owner : req.user._id
    })

    if (!deletionOfTweet) {
        throw new ApiError(404 , "Tweet doesnot exist or you dont own this tweet.")
    }

    return res.status(200).json(
        new ApiResponse(200 , deletionOfTweet , "Tweet deletion successful.")
    )
})

export {
    createTweet,
    getUserTweetById,
    updateTweet,
    deleteTweet
}