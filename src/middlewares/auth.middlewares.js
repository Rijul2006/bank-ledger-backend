import jwt from "jsonwebtoken"
import userModel from "../models/user.models.js"
import tokenBlacklistModel from './../models/blacklist.models.js'

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token not found"
        })
    }

    const isBlacklist = await tokenBlacklistModel.findOne({
            token
        })

        if(isBlacklist){
            return res.status(401).json({
                message:"Unauthorized access, token is blacklisted"
            })
        }

    try{

        const decoded = jwt.verify(token ,process.env.JWT_SECRET_KEY)

        const user = await userModel.findOne({
            _id:decoded.id
        })

        req.user = user
        return next()

    }catch(err){
            return res.status(401).json({
                message:"Unauthorized access"
    })
    
}
}

const authSystemMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token not found"
        })
    }

    const isBlacklist = await tokenBlacklistModel.findOne({
            token
        })

        if(isBlacklist){
            return res.status(401).json({
                message:"Unauthorized access, token is blacklisted"
            })
        }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await userModel.findOne({
            _id:decoded.id
        }).select("+systemUser")

        if(!user.systemUser){
            return res.status(403).json({
                message:"forbidden access, you are not a system user"
            })
        }

        req.user = user
        return next()

    }catch(err){
        res.status(400).json({
            message:"Unauthorized access, invalid token"
        })
    }
}

export  {authMiddleware, authSystemMiddleware}