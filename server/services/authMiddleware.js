const { decrypt } = require('./session'); 
const publicRoutes = ['/api/auth/signin', '/api/auth/signup'];

async function authMiddleware(req, res, next) {
  const path = req.path;
  const isPublicRoute = publicRoutes.includes(path);

  if (isPublicRoute) {
    return next();
  }

  const sessionCookie = req.cookies.session;
  const session = await decrypt(sessionCookie);

  if (!session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = authMiddleware;