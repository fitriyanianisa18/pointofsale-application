const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.cookies['authcookie'];

    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid.' });

        req.user = user;
        next();
    });
};
