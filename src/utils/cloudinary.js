import {v2 as cloudinary} from 'cloudinary'; 
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            
        })

        // file has been uploaded successfully
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

        return null
    }
}

const deleteOnCloudinary = async (imageUrl) => {
    try {
        
        if(!imageUrl) return null

        const public_id = imageUrl.split('/').pop().split('.')[0]
        const response = await cloudinary.uploader.destroy(public_id)

        console.log(response)

        return true

    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary, deleteOnCloudinary }