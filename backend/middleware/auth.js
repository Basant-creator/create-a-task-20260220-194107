const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Extract token part
    const tokenString = token.split(' ')[1];

    // Verify token
    try {
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user payload to request
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};