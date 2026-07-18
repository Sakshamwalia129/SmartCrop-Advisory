'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { findOrCreateOAuthUser } = require('../services/authService');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ── Google Strategy ───────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const name  = profile.displayName || profile.username || 'Google User';
          const user  = await findOrCreateOAuthUser({
            provider:   'google',
            providerId: profile.id,
            email,
            name,
          });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('[passport] Google OAuth is disabled — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set.');
}

// ── GitHub Strategy ───────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // GitHub can return multiple emails; pick the primary verified one
          const email =
            profile.emails?.find((e) => e.primary && e.verified)?.value ||
            profile.emails?.[0]?.value ||
            null;
          const name = profile.displayName || profile.username || 'GitHub User';
          const user = await findOrCreateOAuthUser({
            provider:   'github',
            providerId: String(profile.id),
            email,
            name,
          });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('[passport] GitHub OAuth is disabled — GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set.');
}

// No session serialisation needed — we use stateless JWT
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
