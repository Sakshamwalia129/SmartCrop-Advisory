'use strict';

const { generateToken } = require('../services/authService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Build the redirect URL that the frontend AuthContext listens for.
 * Encodes the user's name and email as query params alongside the JWT.
 * The frontend strips these from the URL immediately after reading them.
 */
const buildSuccessRedirect = (user, token) => {
  const params = new URLSearchParams({
    oauth_token: token,
    oauth_name:  user.name  || '',
    oauth_email: user.email || '',
    oauth_id:    user._id ? user._id.toString() : '',
  });
  return `${FRONTEND_URL}?${params.toString()}`;
};

/**
 * Called by Passport after a successful Google authentication.
 * req.user is the Mongoose User document set by the strategy.
 */
const googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user._id.toString());
    return res.redirect(buildSuccessRedirect(req.user, token));
  } catch (err) {
    console.error('[oauth] googleCallback error:', err.message);
    return res.redirect(`${FRONTEND_URL}?oauth_error=true`);
  }
};

/**
 * Called by Passport after a successful GitHub authentication.
 */
const githubCallback = (req, res) => {
  try {
    const token = generateToken(req.user._id.toString());
    return res.redirect(buildSuccessRedirect(req.user, token));
  } catch (err) {
    console.error('[oauth] githubCallback error:', err.message);
    return res.redirect(`${FRONTEND_URL}?oauth_error=true`);
  }
};

/**
 * Generic OAuth failure handler — Passport sets this when the user
 * denies access or the provider returns an error.
 */
const oauthFailure = (_req, res) => {
  return res.redirect(`${FRONTEND_URL}?oauth_error=true`);
};

module.exports = { googleCallback, githubCallback, oauthFailure };
