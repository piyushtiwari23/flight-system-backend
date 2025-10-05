import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router();

const SECRET = 'SECRET_KEY';

//During the registration process when new user joins
router.post('/register', async (req,res) =>{
    try {
        console.log('=== REGISTER ENDPOINT CALLED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const {email, password, role} = req.body;

        // Validate input
        // if (!email || !password) {
        //     console.log('❌ Missing email or password');
        //     return res.status(400).json({message: 'Email and password are required'});
        // }

        console.log('📧 Email:', email);
        console.log('🔐 Password length:', password?.length);
        console.log('👤 Role:', role || 'user (default)');

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            console.log('❌ User already exists with email:', email);
            return res.status(400).json({message: 'User already exists'});
        }
        console.log('✅ User does not exist, proceeding with registration');

        const hash = await bcrypt.hash(password,10)  // setting the hash value of the password
        console.log('🔒 Password hashed successfully');

        const user = new User({
            email,
            password:hash,
            role: role || 'user'
        })
        console.log('👤 User object created:', {email: user.email, role: user.role});

        await user.save();
        console.log('✅ User saved to database successfully');
        console.log('📝 User ID:', user._id);

        res.json({message: 'User created successfully', userId: user._id, email: user.email})
    } catch (error) {
        console.error('❌ REGISTER ERROR:', error.message);
        console.error('❌ Full error:', error);
        res.status(500).json({message: 'Internal server error', error: error.message});
    }
})

router.post('/login', async (req,res) =>{
    try {
        console.log('=== LOGIN ENDPOINT CALLED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const {email, password } = req.body;    // coming data from login form

        // Validate input
        if (!email || !password) {
            console.log('❌ Missing email or password in login request');
            return res.status(400).json({message: 'Email and password are required'});
        }

        console.log('📧 Login attempt for email:', email);
        console.log('🔐 Password length:', password?.length);

        const user = await User.findOne({email})  // coming data from mongodb
        console.log('🔍 User lookup result:', user ? 'User found' : 'User not found');

        if (user) {
            console.log('👤 Found user:', {id: user._id, email: user.email, role: user.role});
        }

        if(!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({message:'Invalid credentials'})
        }

        console.log('🔒 Comparing passwords...');
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('🔒 Password comparison result:', passwordMatch ? 'Match' : 'No match');

        if(!passwordMatch){
            console.log('❌ Password does not match');
            return res.status(401).json({message:'Invalid credentials'})
        }

        console.log('✅ Credentials verified, generating JWT token');
        const token = jwt.sign({userId: user.id, role: user.role}, SECRET )  // geenration of the JWT token
        console.log('🎫 JWT token generated successfully');
        console.log('✅ Login successful for user:', email);

        res.json({token, role:user.role})
    } catch (error) {
        console.error('❌ LOGIN ERROR:', error.message);
        console.error('❌ Full error:', error);
        res.status(500).json({message: 'Internal server error', error: error.message});
    }
})

export default router