import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    
    if([name, description].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const playList = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playList){
        throw new ApiError(500, "Something went wrong while creating playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200, playList, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User id is invalid")
    }

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            foreignField: "_id",
                            localField: "owner",
                            as: "user",
                            pipeline:[
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$user"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video: "$videos",
                owner: req.user
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200, userPlaylists[0], "Playlists fetched successfully"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "User id is invalid")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            foreignField: "_id",
                            localField: "owner",
                            as: "user",
                            pipeline:[
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullname: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$user"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video: "$videos",
                owner: req.user
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id or Playlist Id is not valid")
    }

    const video = await Playlist.find({
        video: videoId
    })

    console.log(video);
    
    if(video){
        return res.status(200)
        .json(new ApiResponse(200, video, "Video is already added"))
    }


    const playList = await Playlist.findByIdAndUpdate(playlistId,{
        $push:{
            video: new mongoose.Types.ObjectId(videoId)
        }      
    },
    { new: true })

    if(!playList){
        throw new ApiError(500, "Soemthing went wrong while adding video to playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200, playList, "Video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id or Playlist Id is not valid")
    }
    
    const playList = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            video: new mongoose.Types.ObjectId(videoId)
        }
    },
    { new: true })

    if(!playList){
        throw new ApiError(500, "Soemthing went wrong while removing video to playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200, playList, "Video removed successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Video Id or Playlist Id is not valid")
    }

    const playList = await Playlist.findByIdAndDelete(playlistId)

    if(!playList){
        throw new ApiError(400, "Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Video Id or Playlist Id is not valid")
    }

    if([name, description].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const playList = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },
    { new: true })

    if(!playList){
        throw new ApiError(500, "Soemthing went wrong while updating to playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200, playList, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
