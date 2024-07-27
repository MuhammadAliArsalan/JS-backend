import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user?._id 

    if(!content || !userId){
        throw new ApiError(400, "All field are required")
    }
    
    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    if(!tweet){
        throw new ApiError(500, "Something went wrong while making the tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "Tweet added successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                            coverImage: 1,
                            email: 1
                        }
                    }
                    
                ]
            },
            
        },
        {
            $addFields: {
                owner: {
                    $first: "$user"
                }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1
            }
        }
    ]) 

    console.log(tweets);

    // Did not check for the null in tweets because some users may have not tweeted at all
    return res.status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const { content } = req.body

    if(!tweetId || !content){
        throw new ApiError(400, "All fields are required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    console.log(tweet)
    if(!tweet){
        throw new ApiError(500, "Something went wrong while updating the tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!tweetId){
        throw new ApiError(401, "Invaid request")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500, "Something went wrong while updating the tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
