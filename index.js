import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import flightRoutes from './routes/flight.js'

const app = express()

mongoose.connect('mongodb+srv://blogChefUser:y4dPJiTA5v1ZGu8T@cluster0.orjsiol.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log("MongoDB connected"));

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)        // user/ admin login or registration
app.use('/api/flights', flightRoutes)   // adding/ updating/ deleting/ and fething flights

app.listen(5001, ()=> console.log(' Server is running on port 5001..'))