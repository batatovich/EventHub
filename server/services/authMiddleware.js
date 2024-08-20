const { decrypt } = require('./session'); 
const publicRoutes = ['/signin', '/signup'];

async function authenticate(req, res, next) {
  const path = req.path;
  const isPublicRoute = publicRoutes.includes(path);

  if (isPublicRoute) {
    return next();
  }

  const sessionCookie = req.cookies.session;
  const session = await decrypt(sessionCookie);

  if (!session?.userId) {
    return res.redirect('/signin');
  }

  next();
}

module.exports = authenticate;
