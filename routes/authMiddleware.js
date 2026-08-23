const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {

    const token = req.cookies.auth_token;
    

    // 2. Return 401 (Unauthorized) if no token is provided
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 3. Verify the token using your secret key stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        
        // 4. Attach decoded user info to the request object for subsequent routes
        req.user = decoded;
        
        // 5. Pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Return 403 (Forbidden) if the token is invalid or expired
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;
