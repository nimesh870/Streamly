import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscribe = AsyncHandler( async (req , res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400 , "Invalid channel id.")
    
    }

    const existingSubscription = await Subscription.findOne({
        subscriber : req.user._id,
        channel : channelId
    })

    if (existingSubscription) {
        await Subscription.deleteOne({
            _id : existingSubscription._id
        })

        return res.status(200).json(
            new ApiResponse(200 , "Channel unsubscribed successfully.")
        )
    }

    await Subscription.create({
        subscriber : req.user._id,
        channel : channelId
    })

    return res.status(201).json(
        new ApiResponse(201 , "Channel subscribed successfully.")
    )

})

const getUserChannelSubscribers = AsyncHandler( async (req , res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400 , "Invalid channel id.")
    }

    const subscribers = await Subscription.find({
        channel : channelId
    }).populate("subscriber" , "username fullname avatar")

    if (subscribers.length === 0) {
        throw new ApiError(404 , "No user have subscribed this channel yet.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Subscribers of channel fetched successfully." , subscribers)
    )

})

const getSubscribedChannels = AsyncHandler( async (req , res) => {
    const { subscriberId } = req.params;

    if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400 , "Invalid subscriber id.")
    }

    const channelSubscribed = await Subscription.find({
        subscriber : subscriberId
    }).populate("channel" , "username fullname avatar")

    if (channelSubscribed.length === 0) {
        throw new ApiError(404 , "You have not subscribed anyone yet.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Subscribed channel fetched successfully." , channelSubscribed)
    )

})

export {
    toggleSubscribe,
    getUserChannelSubscribers,
    getSubscribedChannels 
}