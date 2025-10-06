import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    passengerDetails: {
        name: String,
        email: String,
        phone: String
    }
});

export default mongoose.model('Booking', bookingSchema);