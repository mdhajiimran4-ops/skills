const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
require('dotenv').config();

// Google OAuth only activates if real credentials are provided in .env.
// This lets the rest of the app run immediately with email/password login
// even before you've set up a Google Cloud project.
const hasGoogleCreds =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';

if (hasGoogleCreds) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;
      // role is passed through the OAuth "state" param from the frontend
      const role = req.query.state || 'student';

      let [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
      let user = rows[0];

      if (!user) {
        const [result] = await pool.query(
          'INSERT INTO users (name, email, google_id, role, status) VALUES (?,?,?,?,?)',
          [name, email, googleId, role, role === 'industry' || role === 'government' ? 'pending' : 'active']
        );
        const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newRows[0];
      } else if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = { passport, hasGoogleCreds };
