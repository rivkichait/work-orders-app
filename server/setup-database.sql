-- Create the database
CREATE DATABASE IF NOT EXISTS request_quote;

-- Use the database
USE request_quote;

-- Create the requests table
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(255) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data (optional)
INSERT INTO requests (name, email, phone, service, message) VALUES
('John Doe', 'john@example.com', '123-456-7890', 'Plumbing', 'Need help with leaky faucet'),
('Jane Smith', 'jane@example.com', '098-765-4321', 'Electrical', 'Outlets not working properly'); 

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
