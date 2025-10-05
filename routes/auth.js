import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router();

const SECRET = 'SECRET_KEY';

//During the registration process when new user joins
router.post('/register', async (req,res) =>{

    const {email, password, role} = req.body;
    const hash = await bcrypt.hash(password,10)  // setting the hash value of the password
    const user = new User({
        email, 
        password:hash,
        role
    })
    await user.save();
    res.json({message: 'User created...'})
})

router.post('/login', async (req,res) =>{

    const {email, password } = req.body;    // coming data from login form
    const user = await User.findOne({email})  // coming data from mongodb

    if(!user || !(await bcrypt.compare(password, user.password))){
        return res.status(401).json({message:'Invalid credentials'})
    }
    const token = jwt.sign({userId: user.id, role: user.role}, SECRET )  // geenration of the JWT token
    res.json({token, role:user.role})
})

export default router