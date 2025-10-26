// Simple session-based authentication check
export const checkAuth = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authenticated'
        });
    }
    req.user = req.session.user;
    next();
};
export const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
