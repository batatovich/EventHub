const { SignJWT, jwtVerify } = require('jose');

const secretKey = process.env.SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

// Encrypt and create a JWT
async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encodedKey);
}

// Decrypt and verify the JWT
async function decrypt(session) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session:', error.message);
    return null;
  }
}

// Create a session (JWT) and set it as an HTTP-only cookie
async function createSession(req, res, userId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
  const session = await new SignJWT({ userId, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  res.cookie('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are secure in production
    expires: new Date(expiresAt * 1000),
    sameSite: 'None',
    path: '/',
  });
}

// Delete the session cookie
function deleteSession(req, res) {
  res.clearCookie('session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });
}

// Get the user ID from the session
async function getUserIdFromSession(req) {
  try {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) {
      throw new Error('Session cookie not found');
    }

    const session = await decrypt(sessionCookie);
    return session.userId;
  } catch (error) {
    console.error('Error retrieving user ID from session:', error);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
  createSession,
  deleteSession,
  getUserIdFromSession,
};
