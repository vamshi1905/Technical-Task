const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/carSellingDB', { useNewUrlParser: true, useUnifiedTopology: true });
const Car = mongoose.model('Car', { make: String, model: String, price: Number });

router.get('/featured-cars', async (req, res) => {
    try {
        const featuredCars = await Car.find().limit(5);
        res.json(featuredCars);
    } catch (error) {
        console.error('Error fetching featured cars:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
