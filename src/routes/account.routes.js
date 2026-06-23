import express from "express";
import { authMiddleware} from './../middlewares/auth.middlewares.js'
import {createAccountController, getAccountController, getAccountBalanceController} from './../controllers/account.controllers.js'

const router = express.Router()

router.post('/create', authMiddleware, createAccountController)
router.get('/', authMiddleware, getAccountController)
router.get('/balance/:accountId', authMiddleware, getAccountBalanceController)


export default router