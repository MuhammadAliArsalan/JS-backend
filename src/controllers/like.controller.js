import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is invalid")
    }
    const likedVideo = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })


    if(likedVideo){
        await Like.findByIdAndDelete(likedVideo._id)
        return res.status(200)
        .json(new ApiResponse(200, {}, "Like removed successfully"))
    }else{
        const like = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        if(!like){
            throw new ApiError(500, "Something went wrong while adding like")
        }

        return res.status(200)
        .json(new ApiResponse(200, like || {}, "Like added successfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment id is invalid")
    }

    const likedComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(likedComment){
        await Like.findByIdAndDelete(likedComment._id)

        return res.status(200)
        .json(new ApiResponse(200, {}, "Like removed successfully"))
    }else{
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        if(!like){
            throw new ApiError(500, "Something went wrong while adding like")
        }

        return res.status(200)
        .json(new ApiResponse(200, like || {}, "Like added successfully"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Video id is invalid")
    }

    const likedTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if(likedTweet){
        await Like.findByIdAndDelete(likedTweet._id)

        return res.status(200)
        .json(new ApiResponse(200, {}, "Like removed successfully"))
    }else{
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        if(!like){
            throw new ApiError(500, "Something went wrong while adding like")
        }

        return res.status(200)
        .json(new ApiResponse(200, like || {}, "Like added successfully"))
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "likedVideo",
                // pipeline: [
                              
                // ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$likedVideo"
                },
            }
        },
        {
            $project: {
                _id:1,
                video:1,
                likedBy: 1
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200, likedVideos || {}, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}