-- Create database
CREATE DATABASE goal_tracker;
USE goal_tracker;

-- Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE Goals (
    GoalID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    GoalName VARCHAR(200) NOT NULL,
    Category ENUM('personal', 'academic', 'professional') DEFAULT 'personal',
    TargetValue DECIMAL(10,2),
    CurrentValue DECIMAL(10,2) DEFAULT 0,
    Deadline DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Progress log table
CREATE TABLE ProgressLog (
    LogID INT PRIMARY KEY AUTO_INCREMENT,
    GoalID INT,
    Date DATE NOT NULL,
    Value DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (GoalID) REFERENCES Goals(GoalID) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO Users (Name, Email, Password) VALUES 
('John Doe', 'john@example.com', 'hashed_password_123');

INSERT INTO Goals (UserID, GoalName, Category, TargetValue, CurrentValue, Deadline) VALUES 
(1, 'Learn React', 'academic', 100, 30, '2024-12-31'),
(1, 'Exercise 30 days', 'personal', 30, 15, '2024-11-30');