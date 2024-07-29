import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const owner = req.user?._id
    
    if(!owner){
        throw new ApiError(401, "Unauthorized Request")
    }

    if(!title || !description){
        throw new ApiError(400, "All fields are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path

    // Checks if the file is really video - 3 formats supported
    if(!videoLocalPath || !(videoLocalPath.endsWith('mp4') || videoLocalPath.endsWith('mpeg-4') || videoLocalPath.endsWith('mov'))){
        
        throw new ApiError(400, "Video file is empty or invalid")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }
    
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)

    if(!uploadedVideo){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
            
    if(!uploadedThumbnail){
        throw new ApiError(500, "Something went wrong while uploading thumbnail")
    }

    const video = await Video.create({
            title,
            description,
            owner,
            videoFile: uploadedVideo.url,
            thumbnail: uploadedThumbnail.url,
            duration: uploadedVideo.duration
        })

    if(!video){
        // Deletes the files from cloudinary so resoureces are not wasted
        await deleteOnCloudinary(uploadedThumbnail)
        await deleteOnCloudinary(uploadedVideo)

        throw new ApiError(500, "Something went wrong while uploading uploading video")
    }
    
    return res.status(200)
    .json(new ApiResponse(200, video, "Video has been uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.aggregate( 
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                fullname: 1,
                                username: 1,
                                avatar: 1,
                                coverImage: 1,
                                email: 1,                
                            }
                        },
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
                    title: 1,
                    description: 1,
                    owner: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    duration: 1,
                    views: 1
                }
            }
        ]
    )

    console.log(video)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body
    const owner = req.user?._id
    
    if(!owner){
        throw new ApiError(401, "Unauthorized Request")
    }

    if(!title || !description){
        throw new ApiError(400, "All fields are required")
    }

    const updatedInfo = {
        title,
        description,
    }

    const thumbnailLocalPath = req.file?.path

    let uploadedThumbnail;
    if(thumbnailLocalPath){
        uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!uploadedThumbnail){
            throw new ApiError(500, "Something went wrong while uploading thumbnail")
        }
        
        updatedInfo.thumbnail = uploadedThumbnail.url
    }
    
    const video = await Video.findByIdAndUpdate(videoId, updatedInfo,
        {new: true}
    )

    if(!video){
        // Deletes the files from cloudinary so resoureces are not wasted
        await deleteOnCloudinary(uploadedThumbnail)
        await deleteOnCloudinary(uploadedVideo)

        throw new ApiError(500, "Something went wrong while uploading uploading video")
    }
    
    return res.status(200)
    .json(new ApiResponse(200, video, "Video has been uploaded successfully"))




})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    console.log(video, video.videoFile);
    await deleteOnCloudinary(video.videoFile)
    await deleteOnCloudinary(video.thumbnail)

    return res.status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { isPublished } = req.body

    if(!isPublished){
        throw new ApiError(400, "Invalid status")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished
            }
        },
        {new: true}
    )

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, video, "Publish status changed successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
