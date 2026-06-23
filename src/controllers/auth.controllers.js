import userModel from '../models/user.models.js'
import jwt from 'jsonwebtoken'
import {sendingRegistrationEmail} from '../services/email.services.js'
import tokenBlackListModel from './../models/blacklist.models.js'

const authRegisterController = async (req, res) => {

    const {email, name, password} = req.body
    try{
        const userExists = await userModel.findOne({email: email})

    if(userExists){
        return res.status(422).json({
            message:"User is already registered",
            status:"failed"
        })
    }

    const userData = await userModel.create({email, name, password})
    const token = jwt.sign({id:userData._id}, process.env.JWT_SECRET_KEY, { expiresIn: "3d" })

    res.cookie("token", token)

    try {
        await sendingRegistrationEmail(userData.email, userData.name)
    } catch (emailError) {
        console.error('Registration email could not be sent:', emailError)
    }

    return res.status(201).json({
        user:{
            _id:userData._id,
            name:userData.name,
            email:userData.email
        },
        token
    })

    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

const authLoginController = async (req, res) => {
    const {email, password} = req.body

    const user = await userModel.findOne({
        email:email
    }).select("+password")

    if(!user){
        return res.status(401).json({
            message:"Unauthorized user"
        })
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if(!isPasswordCorrect){
        return res.status(401).json({
            message:"Unauthorized user!"
        })
    }

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:"3d"})

    res.cookie("token", token)

    return res.status(200).json({
        user: {
            _id:user._id,
            name:user.name,
            email:user.email
        },
        token
    })

}

const authLogoutController = async (req, res) => {
    const token = req.cookie("token") || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(400).json({
            message:"Token is required for logout"
        })
    }
    res.clearCookies()

    await tokenBlackListModel.create({
        token
    })

    return res.status(200).json({
        message:"Logout successful"
    })
    
}

export {authRegisterController, authLoginController, authLogoutController}