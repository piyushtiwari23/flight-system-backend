import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import flightRoutes from './routes/flight.js'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log("MongoDB connected"));

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)        // user/ admin login or registration
app.use('/api/flights', flightRoutes)   // adding/ updating/ deleting/ and fething flights

app.listen(1221, ()=> console.log(' Server is running on port 1221.'))