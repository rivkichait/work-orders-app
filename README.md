# WorkOrdersApp

Full-Stack Web Application for Service and Quote Management

WorkOrdersApp is a complete full-stack project built with Angular (Frontend) and Node.js + Express + MySQL (Backend). It demonstrates end-to-end development, including user authentication, automated workflows, and responsive UI design.

##🔹 Features

### Home Page – includes:
About: Information about the business
Customer Reviews: Display client testimonials
Contact Form: Sends automated emails to both client and business, updates Google Sheets automatically

### Services Page – lists all services offered

### Gallery Page – displays business images

User Login & Account Management – secure login system with session management

Backend Automation – manages requests, validates users, stores data in database, and sends automated notifications

##🔹 Tech Stack

Frontend: Angular, TypeScript, HTML, CSS, Tailwind
Backend: Node.js, Express
Database: MySQL, Google Sheets API
Authentication: JWT, Express Sessions
Other Tools: Nodemailer, REST APIs, Git, Agile Development

Project Structure
client/                  # Angular frontend
├── src/
│   ├── app/             # Components, pages, services
│   ├── assets/          # Images, icons
│   └── styles.css       # Global styles
├── angular.json
└── package.json

server/                  # Node.js backend
├── routes/              # API routes
├── models/              # Database models
├── server.js            # Express server
├── package.json
└── .env-example         # Example environment variables

##🔹 How It Works

A user fills out the contact or quote request form on the website

The server sends automated emails to both the client and the business

Request details are automatically updated in Google Sheets

The Login system allows clients to track their requests

##🔹 Getting Started

Clone the repository:

git clone <repo-link>

Install dependencies:

cd client
npm install
cd ../server
npm install

Create a .env file in the server/ directory based on .env-example

Start the server:

node server.js

Start the client:

cd client
ng serve --port 4202

🔹 Why This Project Stands Out

Demonstrates end-to-end full-stack development

Integrates real-world workflows: automated emails, Google Sheets updates, and user authentication

Features a responsive Angular frontend with multiple pages and reusable components

Implements secure backend practices with JWT and session management

Highlights ability to design complete system architecture from database to UI



