// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

// Second Approch - Distributed

connectDB()








// First Approach - Everything in index.js 

// import express from "express"
// const app=express()

// ( async ()=> {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/
//             ${DB_NAME}`)

//         app.on("error",(error) => {
//             console.log("ERR: ",error);
//             throw error
//         })    

//         app.listen(process.env.PORT,() => {
//             console.log(`App is linstening on port ${process.env.PORT}`);
//         })    

//     } catch (error) {
//         console.error("ERROR : ",error)
//     }
// })
