  // WARNING: Disables SSL certificate validation. Use ONLY for local development!
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
require('dotenv').config();  /** Loads the environment variables from the .env file. */

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const session = require('express-session');
const auth = new google.auth.GoogleAuth({
    keyFile: '../src/google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const bcrypt = require('bcrypt'); /** Hashes passwords. */
const crypto = require('crypto'); /** Generates random tokens. */


/** Appends the values to the Google Sheet. */
async function appendToSheet(values) {
    console.log('appendToSheet() called with values:', values);

    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const range = 'request_quote-sheet!A:G'; /** The range of the sheet. */
    /** Tries to append the values to the Google Sheet. */
    try {
      const client = await auth.getClient();
  
      /** Appends the values to the Google Sheet. */
      await sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
  
      console.log('Append to Google Sheet complete!');
    } catch (err) {
      console.error('Google Sheets API error:', err);
    }
  }
  
  
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/** Uses the session middleware. */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } /**change to true when using HTTPs. */
}));

/** Login endpoint. */
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing email or password' });
  }
  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('DB error on login:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Email or password not correct' });
    }
    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Email or password not correct' });
      }
      req.session.user = { id: user.id, email: user.email };
      /** Returns the user's first name (or full name). */
      res.json({
        success: true,
        message: 'Login successful',
        name: user.first_name || user.email,
        fullName: (user.first_name && user.last_name) ? user.first_name + ' ' + user.last_name : user.first_name || user.email
      });
    } catch (compareErr) {
      console.error('Error comparing passwords:', compareErr);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

/** Registration endpoint. */
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password required' });
  }
  try {
    /** Checks if the user already exists. */
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'email already exists' });
    }
    /** Hashes the password. */
    const hashedPassword = await bcrypt.hash(password, 10);
    /** Inserts the new user into the database. */
    await db.promise().query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone]
    );
    /** Returns a success message. */
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    /** Returns a server error message. */
    res.status(500).json({ message: 'Server error' });
  }
});

/** Path protected for logged in users. */
app.get('/admin-only', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome ${req.session.user.email}, this is an admin-only page.`);
  } else {
    res.status(401).send('Access denied. Please log in.');
  }
});
/** Logout endpoint. */
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error during logout.');
    }
    res.send('You have been logged out.');
  });
});

app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4202'], /** The origin of the request. */
  credentials: true
}));

/** Creates a connection to the MySQL database. */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/** Connects to the MySQL database. */
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  /** Logs a message to the console. */
  console.log('Connected to MySQL database');
});

/** Request quote endpoint. */
app.post('/request-quote', (req, res) => {
  const { name, email, phone, service, message } = req.body;
  const sql = 'INSERT INTO requests (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)';
  /** Inserts the request into the database. */
  const values = [name, email, phone, service, message];

  /** Inserts the request into the database. */
  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).send('An error occurred. Please try again later.');
    }

    sendEmailToAdmin({ name, email, phone, service, message });
    sendEmailToClient({ name, email, service });

    /** Sends an email to the admin with the request details. */
    res.json({ message: 'Your request has been received!<br>We will contact you shortly.' });
    /** Prepares the row for Google Sheets. */
    const newRow = [result.insertId, name, email, "'" + phone, service, message, new Date().toLocaleString()];
    /** Logs a message to the console. */
    console.log('Calling appendToSheet with:', newRow);
    /** Tries to append the values to the Google Sheet. */
    try {
      await appendToSheet(newRow);
      /** Logs a message to the console. */
      console.log('Google Sheet updated with new request.');
      /** Logs an error to the console. */
    } catch (sheetErr) {
      console.error('Error appending to Google Sheet:', sheetErr);
    }
    
  });
});

/** Starts the server. */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/** Sends an email to the admin with the request details. */
const nodemailer = require('nodemailer'); /** Nodemailer for sending emails. */    

/** Creates a reusable transporter using Gmail. */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,      /** The email address of the admin. */
    pass: process.env.ADMIN_PASSWORD    /** The app-specific password from Google. */
  }
});

/** Sends an email to the admin with the form data. */
function sendEmailToAdmin(data) {
  const mailOptions = {
    from: `"Contact Form" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '📬 New Quote Request Received',
    html: `
      <h2>New Quote Request Details:</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `
  };
  
  /** Sends an email to the admin with the form data. */
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      /** Logs an error to the console. */
      console.error('Error sending admin email:', error);
    } else {
      /** Logs a message to the console. */
      console.log('Admin email sent successfully:', info.response);
    }
  });
}

/** Sends a confirmation email to the client. */
function sendEmailToClient(data) {
    const mailOptions = {
      from: `"Chait Handyman & Carpenter" <${process.env.ADMIN_EMAIL}>`,
      to: data.email,
      subject: '✅ We received your request!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: left; padding: 10px;">
            <img src="https://drive.google.com/uc?export=view&id=1KOMZvVBQ3XidjKLQLI_5d3w4K-pwotVe" alt="Chait Handyman & Carpenter" style="max-height: 100px;" />
          </div>
          <h2 style="color: #444;">Thank you for contacting <span style="color:#007BFF;">Chait Handyman & Carpenter</span></h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for reaching out to us – you did the right thing!</p>
          <p><strong>Service requested:</strong> ${data.service}</p>
          <p>We have received your request and will get back to you as soon as possible.</p>
  
          <br>
          <p>Meanwhile, feel free to follow us and stay updated:</p>
          <div style="text-align: left; margin: 0;">
              <a href="https://www.instagram.com/chaitcarprnter/" target="_blank" style="text-decoration: none; font-size: 1.5em; margin: 0 8px;">📸</a>
              |
              <a href="http://localhost:4202/" target="_blank" style="text-decoration: none; font-size: 1.5em; margin: 0 8px;">🌐</a>
          </div>
  
          <br>
          <p>Best regards,<br><strong>Chait Handyman & Carpenter</strong></p>
          <hr style="margin-top: 20px;">
          <small>This is an automated confirmation email. If you didn't submit this request, please ignore it.</small>
        </div>
      `
    };
  
    /** Sends a confirmation email to the client. */
    transporter.sendMail(mailOptions, (error, info) => {
      /** Logs an error to the console. */
      if (error) {
        console.error('Error sending client email:', error);
        /** Logs a message to the console. */
      } else {
        console.log('Client email sent successfully:', info.response);
      }
    });
  }

  /** Optional logout endpoint. */
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/** Forgot password endpoint. */
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ exists: false });

  const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.json({ exists: false });
  }
  const user = rows[0];
  const firstName = user.first_name || '';

  /** Generates a secure token. */
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); /** 1 hour from now. */

  /** Stores the token and expiry in the database. */
  await db.promise().query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token, expiry, email]
  );

  /** Sends a reset email to the user. */
  const resetLink = `http://localhost:4202/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const mailOptions = {
    from: `"Chait Handyman & Carpenter" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hello${firstName ? ' ' + firstName : ''},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p>
        <a href="${resetLink}" style="
          display: inline-block;
          background: #f3730b;
          color: #fff;
          padding: 0.7em 1.5em;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1em;
        ">Reset Password Now</a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  /** Sends a reset email to the user. */
  transporter.sendMail(mailOptions, (error, info) => {
    /** Logs an error to the console. */
    if (error) {
      console.error('Error sending reset email:', error);
      /** Returns a server error message. */
      return res.status(500).json({ exists: true, error: 'Failed to send email' });
    } else {
      /** Logs a message to the console. */
      console.log('Reset email sent:', info.response);
      /** Returns a success message. */
      return res.json({ exists: true });
    }
  });
});

/** Resets the password endpoint. */
app.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  /** Password validation: at least 8 chars, contains a letter and a number. */
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and contain both a letter and a number.' });
  }
  try {
    /** Finds the user by email and token. */
    const [rows] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND reset_token = ?',
      [email, token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
    const user = rows[0];
    const firstName = user.first_name || '';
    /** Checks if the token is expired. */
    if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
    /** Checks if the new password is the same as the old one. */
    const isSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isSame) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
    /** Hashes the new password. */
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    /** Updates the password and clears the token/expiry. */
    await db.promise().query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    /** Sends a success email to the user. */
    const signInLink = 'http://localhost:4202/'; /** The sign-in link. */
    const mailOptions = {
      from: `"Chait Handyman & Carpenter" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: 'Your password was reset successfully',
      html: `
        <p>Hello${firstName ? ' ' + firstName : ''},</p>
        <p>Your password has been reset successfully.</p>
        <p><a href="${signInLink}" style="
          display: inline-block;
          background: #f3730b;
          color: #fff;
          padding: 0.7em 1.5em;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1em;
        ">Sign in now</a></p>
        <p>If you did not perform this action, please contact us immediately.</p>
      `
    };
    /** Sends a success email to the user. */
    transporter.sendMail(mailOptions, (error, info) => {
      /** Logs an error to the console. */
      if (error) {
        console.error('Error sending success email:', error);
        /** Logs a message to the console. */
      } else {
        console.log('Success email sent:', info.response);
      }
    });
    /** Returns a success message. */
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** Gets the user requests from the database. */
app.get('/user-requests', (req, res) => {
  const email = req.query.email;
  /** Checks if the email is missing. */
  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing email' });
  }
  db.query('SELECT * FROM requests WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, requests: results });
  });
});

  
  
