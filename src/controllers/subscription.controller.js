import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id is not valid ")
    }

    const isSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    console.log(isSubscribed);
    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed._id)

        return res.status(200)
        .json(new ApiResponse(200, {}, "Unsubscribed successfully"))
    }

    const subscribed = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })

    if(!subscribed){
        throw new ApiError(500, "Something went wrong while subscribing")
    }

    return res.status(200)
    .json(new ApiResponse(200, subscribed, "Subscribed successfully"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id is not valid")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "subscriber",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber: {
                    $first: "$user"
                } 
            }
        },
    ])

    return res.status(200)
    .json(new ApiResponse(200, subscriberList || {}, "Channel Subscribers fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Subscriber id is not valid")
    }

    const subscribedChannelList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "channel",
                as: "channel",
                pipeline: [
                    {
                        $project:{
                            _id: 1,
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel"
                }
            },
            
        },
    ])


    return res.status(200)
    .json(new ApiResponse(200, subscribedChannelList || {}, "Subscribed channel fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}