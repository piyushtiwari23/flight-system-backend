/**
 * @fileoverview Flight Router - Handles all flight-related operations
 * This module provides endpoints for flight CRUD operations with authentication
 * and file upload capabilities for airline logos.
 */

import express from 'express'
import Flight from '../models/Flight.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'

const router = express.Router()

const SECRET = 'SECRET_KEY'

// Configure logging function for consistent log format
const log = {
    info: (message, data = {}) => {
        console.log(`[INFO] [${new Date().toISOString()}] ${message}`, data);
    },
    error: (message, error) => {
        console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error);
    },
    debug: (message, data = {}) => {
        console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, data);
    }
}

/**
 * Multer storage configuration for handling file uploads
 * Stores airline logo images in the uploads directory with sanitized filenames
 */
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const newFilename = Date.now() + "-" + cleanName;
        log.info('Creating new file upload', { originalName: file.originalname, newName: newFilename });
        cb(null, newFilename);
    }
});

/**
 * File filter to ensure only image files are uploaded
 * Validates file mimetype before upload
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        log.info('Valid image file uploaded', { 
            filename: file.originalname, 
            mimetype: file.mimetype 
        });
        cb(null, true);
    } else {
        log.error('Invalid file type rejected', { 
            filename: file.originalname, 
            mimetype: file.mimetype 
        });
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Middleware to verify admin privileges
 * Checks JWT token from Authorization header and validates admin role
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    log.debug('Verifying admin token', { token: token ? 'Present' : 'Missing' });

    try {
        const data = jwt.verify(token, SECRET);
        log.info('Token verified', { userId: data.id, role: data.role });

        if (data.role !== 'admin') {
            log.error('Non-admin access attempt', { userId: data.id, role: data.role });
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        next();
    } catch (error) {
        log.error('Token verification failed', { error: error.message });
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// New Flight record  to be Added
router.post('/', verifyAdmin, upload.single('logo'), async (req,res) =>{
    try {
        const {flightNumber, departure , arrival, time} = req.body  // passing the data of the flight record to be added into the DB

        if (!req.file) {
            return res.status(400).json({message: 'Logo image is required'});
        }

        const logo = req.file.filename;
        const flight = new Flight({flightNumber, departure , arrival, time, logo})

        await flight.save()
        res.json(flight)
    } catch (error) {
        console.error('Error creating flight:', error);
        res.status(500).json({message: 'Error creating flight'});
    }
})

router.put('/:id', verifyAdmin, upload.single('logo'), async (req, res) => {
    const { flightNumber, departure, arrival, time } = req.body;
    const updateData = { flightNumber, departure, arrival, time };
    if (req.file) updateData.logo = req.file.filename;

    const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedFlight);
  });

  // Delete flight
  router.delete('/:id', verifyAdmin, async (req, res) => {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight deleted' });
  });


/**
 * @route GET /api/flights
 * @description Fetch all available flights
 * @access Public
 * @returns {Array<Flight>} List of all flights
 */
router.get('/', async(req, res) => {
    try {
        log.info('Fetching all flights');
        const flights = await Flight.find();
        log.info(`Found ${flights.length} flights`);
        
        if (flights.length === 0) {
            log.debug('No flights found in database');
        } else {
            log.debug('Flights retrieved', { 
                count: flights.length,
                flightNumbers: flights.map(f => f.flightNumber)
            });
        }
        
        res.json(flights);
    } catch (error) {
        log.error('Error fetching flights', error);
        res.status(500).json({ 
            error: 'Failed to fetch flights',
            details: error.message 
        });
    }
})

export default router;