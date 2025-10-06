/**
 * @fileoverview Booking Router - Handles all booking-related operations
 */

import express from 'express';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET = 'SECRET_KEY';

// Logger utility
const log = {
    info: (message, data = {}) => {
        console.log(`[Booking][INFO] [${new Date().toISOString()}] ${message}`, data);
    },
    error: (message, error) => {
        console.error(`[Booking][ERROR] [${new Date().toISOString()}] ${message}`, error);
    }
};

/**
 * Middleware to verify user authentication
 */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        log.error('Token verification failed', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * @route POST /api/bookings
 * @description Create a new booking
 * @access Private
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { flightId, passengerDetails } = req.body;
        const userId = req.userId;

        log.info('Creating new booking', { userId, flightId });

        const booking = new Booking({
            userId,
            flightId,
            passengerDetails,
            status: 'pending'
        });

        await booking.save();
        log.info('Booking created successfully', { bookingId: booking._id });

        res.status(201).json(booking);
    } catch (error) {
        log.error('Error creating booking', error);
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});

/**
 * @route GET /api/bookings
 * @description Get all bookings for the current user
 * @access Private
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId })
            .populate('flightId')
            .sort({ bookingDate: -1 });

        log.info('Fetched user bookings', { 
            userId: req.userId, 
            count: bookings.length 
        });

        res.json(bookings);
    } catch (error) {
        log.error('Error fetching bookings', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

/**
 * @route PUT /api/bookings/:id
 * @description Update booking status
 * @access Private
 */
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        log.info('Booking updated', { 
            bookingId: booking._id, 
            newStatus: status 
        });

        res.json(booking);
    } catch (error) {
        log.error('Error updating booking', error);
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
});

/**
 * @route DELETE /api/bookings/:id
 * @description Cancel booking
 * @access Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        log.info('Booking cancelled', { bookingId: booking._id });
        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        log.error('Error cancelling booking', error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

export default router;