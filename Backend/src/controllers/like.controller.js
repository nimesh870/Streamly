import mongoose from "mongoose";
import { Like } from "../models/likes.models.js";
import { Comment } from "../models/comment.models.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.models.js";

const toggleCommentLike = AsyncHandler( async (req , res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment id.")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404 , "Comment doesnot exists.")
    }

    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    })

    if (existingLike) {
        await Like.deleteOne({
            _id : existingLike?._id
        })

        return res.status(200).json(
            new ApiResponse(200 , "Comment unliked successfully.")
        )
    }

    await Like.create({
        comment : commentId,
        likedBy : req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201 , "Comment liked successfully." , null)
    )
})

const toggleVideoLike = AsyncHandler( async (req , res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video id.")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404 , "Video doesnot exists.")
    }

    const existingLike = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    })

    if (existingLike) {
        await Like.deleteOne({
            _id : existingLike?._id
        })

        return res.status(200).json(
            new ApiResponse(200 , "Video unliked successfully.")
        )
    }

    await Like.create({
        video : videoId,
        likedBy : req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201 , "Video liked successfully." , null)
    )


})

const toggleTweetLike =  AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404 , "Tweet doesnot exist.")
    }

    const existingLike = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user._id
    });

    if (existingLike) {
        await Like.deleteOne({
            tweet : tweetId,
            likedBy : req.user._id
        })

        return res.status(200).json(
            new ApiResponse(200 , "Tweet unliked successfully.")
        )
    }

    await Like.create({
        tweet : tweetId,
        likedBy : req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201 , "Tweet liked successfully." , null)
    )

})

const getLikedVideos = AsyncHandler( async (req , res) => {

    const {limit = 10 , page = 1} = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new ApiError(400 , "Page number must a positive integer.")
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
        throw new ApiError(400 , "Limit must be in between 1 and 50.")
    }

    const skip = (pageNumber - 1)*limitNumber
    
    const likedVideos = await Like.aggregate(
        [
            {
                $match : {
                    likedBy : req.user._id,
                    video : { $exists : true }
                }
            },

            {
                $sort : {
                    createdAt : -1
                }
            },

            {
                $skip : skip
            },

            {
                $limit : limitNumber
            },

            {
                $lookup : {
                    from : "videos",
                    localField : "video",
                    foreignField : "_id",
                    as : "videoDetails"
                }
            },

            {
                $unwind : "$videoDetails"
            },

            {
                $replaceRoot : {
                    newRoot : "$videoDetails"
                }
            }
        ]
    );

    if (likedVideos.length === 0) {
        throw new ApiError(404 , "User has not liked any videos yet.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Liked videos fetched successfully." , 
            {
                likedVideos,
                pagination: {
                    currentPage: pageNumber,
                    hasNextPage: likedVideos.length === limitNumber,
                    hasPreviousPage: pageNumber > 1
                }
            }
        )
    )
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos
}