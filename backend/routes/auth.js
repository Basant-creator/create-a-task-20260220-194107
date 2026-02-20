const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User').User; // Access the User model
const { validateRegister, validateLogin } = require('../utils/validation');
const authMiddleware = require('../middleware/auth');

/**
 * @route POST /api/auth/signup
 * @desc Register new user
 * @access Public
 */
router.post('/signup', async (req, res, next) => {
    try {
        const { error } = validateRegister(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = new User({
            email,
            password,
            name: email.split('@')[0] // Default name from email
        });

        // Hashing is handled in User pre-save hook

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ success: true, message: 'User registered successfully', data: { token } });
            }
        );

    } catch (err) {
        console.error(err.message);
        next(err); // Pass error to global error handler
    }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ success: true, message: 'Logged in successfully', data: { token } });
            }
        );

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get authenticated user's data
 * @access Private
 */
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

module.exports = router;