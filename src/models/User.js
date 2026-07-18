'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: {
      // null for OAuth-only users
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    providerId: {
      // OAuth provider's user ID — null for local users
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Compound index: provider + providerId for fast OAuth lookups
userSchema.index({ provider: 1, providerId: 1 }, { sparse: true });

/**
 * Hash a plain-text password and store it in passwordHash.
 * Only runs when passwordHash is new/modified and not already a bcrypt hash.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  // Guard: skip if already hashed (e.g. loaded from DB) — bcrypt hashes start with $2
  if (this.passwordHash.startsWith('$2')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compare a plain-text password against the stored hash.
 * Returns false immediately for OAuth users who have no password.
 */
userSchema.methods.comparePassword = async function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

/**
 * Return a safe user object (no passwordHash).
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    provider: this.provider,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
