const router = require('express').Router();
const path = require('path');
const userRoutes = require('./user');

// User Routes
router.use('/user', userRoutes);

// If no API routes are hit, send the React app
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

module.exports = router;
