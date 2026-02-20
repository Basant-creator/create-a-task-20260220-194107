const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User').User; // Access the User model
const Task = require('../models/User').Task; // Access the Task model
const { validateTask, validateProfileUpdate, validatePasswordChange } = require('../utils/validation');
const bcrypt = require('bcryptjs');

// --- User Profile Routes ---

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { error } = validateProfileUpdate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, bio } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = name || user.name;
        user.bio = bio || user.bio;
        // Profile picture upload logic would go here, possibly using multer for file uploads

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', data: user });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

/**
 * @route PUT /api/users/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', auth, async (req, res, next) => {
    try {
        const { error } = validatePasswordChange(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword; // Mongoose pre-save hook will hash it
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

/**
 * @route DELETE /api/users/delete-account
 * @desc Delete user account
 * @access Private
 */
router.delete('/delete-account', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.deleteOne({ _id: req.user.id }); // Mongoose remove method might be preferred depending on cascade needs.
        await Task.deleteMany({ user: req.user.id }); // Delete all tasks associated with the user

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});


// --- Task Management Routes ---

/**
 * @route POST /api/users/tasks
 * @desc Create a new task for the authenticated user
 * @access Private
 */
router.post('/tasks', auth, async (req, res, next) => {
    try {
        const { error } = validateTask(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { title, description, dueDate, priority } = req.body;

        const newTask = new Task({
            user: req.user.id,
            title,
            description,
            dueDate,
            priority,
            completed: false
        });

        await newTask.save();
        res.status(201).json({ success: true, message: 'Task created successfully', data: newTask });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

/**
 * @route GET /api/users/tasks
 * @desc Get all tasks for the authenticated user
 * @access Private
 */
router.get('/tasks', auth, async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1, createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

/**
 * @route GET /api/users/tasks/:id
 * @desc Get a single task by ID for the authenticated user
 * @access Private
 */
router.get('/tasks/:id', auth, async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, data: task });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Task ID' });
        }
        next(err);
    }
});

/**
 * @route PUT /api/users/tasks/:id
 * @desc Update a task by ID for the authenticated user
 * @access Private
 */
router.put('/tasks/:id', auth, async (req, res, next) => {
    try {
        const { error } = validateTask(req.body, true); // Pass true to allow partial updates (for example, just completed status)
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { title, description, dueDate, priority, completed } = req.body;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { title, description, dueDate, priority, completed, updatedAt: Date.now() } },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
        }

        res.json({ success: true, message: 'Task updated successfully', data: updatedTask });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Task ID' });
        }
        next(err);
    }
});

/**
 * @route DELETE /api/users/tasks/:id
 * @desc Delete a task by ID for the authenticated user
 * @access Private
 */
router.delete('/tasks/:id', auth, async (req, res, next) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
        }

        res.json({ success: true, message: 'Task deleted successfully' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Task ID' });
        }
        next(err);
    }
});

module.exports = router;