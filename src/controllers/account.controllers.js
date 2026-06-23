import accountModel from './../models/account.models.js'

const createAccountController = async (req, res) => {
    const user = req.user
    const account = await accountModel.create({
        userId:user._id
    })

    res.status(201).json({
        account:account
    })
}

const getAccountController = async(req, res)=> {
    const userId = req.user._id

    const accounts = await accountModel.find({
        userId:userId
    })

    res.status(200).json({
        message:"Accounts fetched successfully",
        accounts
    })
}

const getAccountBalanceController = async (req, res) => {
    const {accountId} = req.params

    const account = await accountModel.findOne({
        _id:accountId,
        userId:req.user._id
    })

    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }

    const balance = await account.getBalance()

    res.status(200).json({
        message:`Account balance is ${balance}`
    })
}

export {createAccountController, getAccountController, getAccountBalanceController}