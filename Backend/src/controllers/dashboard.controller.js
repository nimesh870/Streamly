import { Video } from "../models/video.model.js";
import { Like } from "../models/likes.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const getChannelVideos = AsyncHandler( async (req , res) => {
    const {page = 1 , limit = 15} = req.query;

    const pageNumber = Math.max(Number(page) , 1);
    const limitNumber = Math.min(Math.max(Number(limit) , 1) , 50)
    const skip = (pageNumber - 1) * limitNumber;

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new ApiError(400 , "Page number must be positive integer.")
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
        throw new ApiError(400 , "Limit must be an integer between 1 and 50.")
    }

    const [videos , totalVideos] = await Promise.all([
        Video.find({
            owner : req.user._id
        })
        .sort({createdAt : -1})
        .skip(skip)
        .limit(limitNumber),

        Video.countDocuments({
            owner : req.user._id
        })
    ])

    const totalPages = Math.ceil(totalVideos / limitNumber)

    return res.status(200).json(
        new ApiResponse(
            200,
            "Videos fetched successfully."
        ),
        {
            videos,
            pagination : {
                currentPage : pageNumber,
                totalPages,
                totalVideos,
                hasNextPage : totalPages > pageNumber,
                hasPreviousPage : pageNumber > 1
            }
        }
    )


})

export {
    getChannelVideos
}