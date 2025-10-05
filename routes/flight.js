import express from 'express'
import Flight from '../models/Flight.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'

const router= express.Router()

const SECRET = 'SECRET_KEY'

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req,file,cb) =>{
        // Clean filename and ensure it's an image
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + "-" + cleanName)
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
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

const verifyAdmin = (req,res,next) => {
    const token = req.headers.authorization?.split(' ')[1] // token will come from the postman headers
    try{
        const data = jwt.verify(token, SECRET)

        if (data.role !== 'admin')
            return res.sendStatus(403)
            next();
    }
    catch {
        res.sendStatus(401)
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


// Fetching all the flight records
router.get('/', async(req,res) =>{
    const flights = await Flight.find();
    res.json(flights)
})

export default router;