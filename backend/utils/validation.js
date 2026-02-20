const Joi = require('joi');

// Joi schema for user registration
const validateRegister = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().min(6).required().label('Password'),
        name: Joi.string().min(3).max(50).label('Name') // Optional for signup, will default to email part
    });
    return schema.validate(data);
};

// Joi schema for user login
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().min(6).required().label('Password')
    });
    return schema.validate(data);
};

// Joi schema for task creation/update
const validateTask = (data, isUpdate = false) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).when('isUpdate', {
            is: false,
            then: Joi.required(),
            otherwise: Joi.optional()
        }).label('Title'),
        description: Joi.string().max(500).allow('').optional().label('Description'),
        dueDate: Joi.date().allow(null).optional().label('Due Date'),
        priority: Joi.string().valid('low', 'medium', 'high').optional().label('Priority'),
        completed: Joi.boolean().optional().label('Completed Status')
    });

    // If it's an update, we want to allow partial updates, so no fields are strictly required
    // unless explicitly specified with .required(). Here, title is required for creation, optional for update.
    return schema.validate(data, { context: { isUpdate } });
};

// Joi schema for user profile update
const validateProfileUpdate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).optional().label('Name'),
        bio: Joi.string().max(200).allow('').optional().label('Bio'),
        // Add other profile fields if applicable, e.g., avatar: Joi.string().uri().optional()
    });
    return schema.validate(data);
};

// Joi schema for password change
const validatePasswordChange = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string().min(6).required().label('Current Password'),
        newPassword: Joi.string().min(6).required().label('New Password'),
        // Joi.ref ensures newPassword is not the same as current for extra security
        // and matches newPassword_confirmation on frontend (though not explicit here)
    });
    return schema.validate(data);
};


module.exports = {
    validateRegister,
    validateLogin,
    validateTask,
    validateProfileUpdate,
    validatePasswordChange
};