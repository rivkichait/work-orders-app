# Request Quote Web Application

A full-stack web application that allows customers to submit service quote requests.  
The system stores requests in a MySQL database and sends notifications to the administrator via email and Google Sheets.  
Admin users can log in, manage requests, and view submitted quotes in a secure dashboard.

---

## Technologies

**Frontend**
- Angular
- Angular Router
- Animate.css
- Font Awesome
- Google Fonts (Rubik)

**Backend**
- Node.js
- Express.js
- Express Session (for authentication)

**Database**
- MySQL

**Integrations**
- Nodemailer (Email notifications)
- Google Sheets API

---

## Features

- Customer service request form
- Data stored in MySQL database
- Admin login system with session authentication
- View submitted requests in admin dashboard
- Email notifications to administrator
- Automatic logging of requests to Google Sheets
- Dynamic content rendering in Angular with `ngFor`
- Responsive frontend design with Animate.css
- Font Awesome icons and Google Fonts integration

---

## Project Structure

request-quote-app
│
├── client/              # Angular frontend
│   ├── src/
│   └── package.json
│
├── server/              # Node.js backend
│   ├── server.js
│   ├── package.json
│   └── setup-database.sql
│
└── README.md

---

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```
**Frontend:**
```bash
cd client
npm install
```

---

### 2. Database Setup
**Option A: Using MySQL Command Line**
```bash
mysql -u root -p < server/setup-database.sql
```
**Option B: Manual Database Creation**
```bash
CREATE DATABASE request_quote;

CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(255) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env` in the `server/` directory and fill in your own credentials:

```bash
cp .env.example .env
```

**Important:**

Replace placeholders with real credentials
Gmail requires an App Password
.env is in .gitignore and won’t be committed
---

### 4. Start the Application
**Backend:**
```bash
cd server
node server.js
```
**Frontend:**
```bash
cd client
ng serve
```

Application will run at: http://localhost:4200

---

## Troubleshooting

### MySQL Connection Issues

**Access denied for user 'root'@'localhost'**
- Ensure MySQL server is running
- Verify your root password
- Update `.env` with correct credentials

**Unknown database 'request_quote'**
- Run the setup script or manually create the database

**ER_ACCESS_DENIED_ERROR**
- Verify username and password
- Ensure the user has database permissions

**Useful MySQL Commands**
```bash
mysql -u root -p
SHOW DATABASES;
USE request_quote;
SHOW TABLES;
DESCRIBE requests;
```
---

## Notes
- The application uses Angular Router for navigating between pages
- Customer recommendations and projects are rendered dynamically from TypeScript arrays using `ngFor`
- Admin login and session management are required to access submitted requests