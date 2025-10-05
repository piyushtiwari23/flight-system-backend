import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNumber : String,
    departure :String,
    arrival : String,
    time: String,
    logo: String
})

export default mongoose.model('Flight', flightSchema)