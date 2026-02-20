const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Task Schema ---
const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    dueDate: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// --- User Schema ---
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] // Basic email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ''
    },
    avatar: {
        type: String, // URL to profile picture
        default: 'https://via.placeholder.com/150/6366f1/ffffff?text=U'
    }
    // Add settings fields here if not creating a separate settings model
    // e.g., defaultDashboardView: { type: String, default: 'pending-tasks' }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password (optional, can be done directly with bcrypt.compare)
// UserSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// Create models
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema); // Export Task as well

module.exports = { User, Task };