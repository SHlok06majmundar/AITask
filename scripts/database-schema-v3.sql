-- Enhanced database schema for team task management

-- Create team_tasks collection structure
-- This represents the MongoDB collection for team tasks
CREATE TABLE IF NOT EXISTS team_tasks_schema (
  _id VARCHAR(24) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in-progress', 'review', 'completed') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  progress INT DEFAULT 0,
  assignedTo VARCHAR(255) NOT NULL,
  createdBy VARCHAR(255) NOT NULL,
  teamId VARCHAR(255),
  tags JSON,
  dueDate DATETIME,
  comments JSON,
  timeTracking JSON,
  attachments JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assigned_to (assignedTo),
  INDEX idx_created_by (createdBy),
  INDEX idx_team_id (teamId),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Sample team tasks data
INSERT INTO team_tasks_schema (_id, title, description, status, priority, progress, assignedTo, createdBy, teamId, tags, dueDate, comments, timeTracking, attachments) VALUES
('507f1f77bcf86cd799439011', 'Implement User Authentication', 'Set up Clerk authentication with proper user management', 'in-progress', 'high', 75, 'user_2abc123', 'user_2def456', 'team_001', '["frontend", "auth", "security"]', '2024-02-15 17:00:00', '[]', '{"estimated": 8, "actual": 6, "sessions": []}', '[]'),
('507f1f77bcf86cd799439012', 'Design Database Schema', 'Create comprehensive MongoDB schema for all collections', 'completed', 'high', 100, 'user_2def456', 'user_2abc123', 'team_001', '["backend", "database", "mongodb"]', '2024-02-10 12:00:00', '[]', '{"estimated": 4, "actual": 5, "sessions": []}', '[]'),
('507f1f77bcf86cd799439013', 'Create Team Invitation System', 'Build end-to-end team invitation workflow with notifications', 'review', 'urgent', 90, 'user_2ghi789', 'user_2abc123', 'team_001', '["frontend", "backend", "notifications"]', '2024-02-20 15:00:00', '[]', '{"estimated": 12, "actual": 10, "sessions": []}', '[]'),
('507f1f77bcf86cd799439014', 'Implement Real-time Updates', 'Add WebSocket support for live task updates', 'todo', 'medium', 0, 'user_2jkl012', 'user_2def456', 'team_001', '["realtime", "websockets", "performance"]', '2024-02-25 10:00:00', '[]', '{"estimated": 6, "actual": 0, "sessions": []}', '[]'),
('507f1f77bcf86cd799439015', 'Setup CI/CD Pipeline', 'Configure automated testing and deployment', 'todo', 'low', 0, 'user_2mno345', 'user_2ghi789', 'team_001', '["devops", "automation", "testing"]', '2024-03-01 14:00:00', '[]', '{"estimated": 8, "actual": 0, "sessions": []}', '[]');

-- Create activities collection for task tracking
CREATE TABLE IF NOT EXISTS activities_schema (
  _id VARCHAR(24) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  action ENUM('task_created', 'task_updated', 'task_deleted', 'task_assigned', 'comment_added', 'time_logged') NOT NULL,
  taskId VARCHAR(24),
  taskTitle VARCHAR(255),
  assignedTo VARCHAR(255),
  details JSON,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (userId),
  INDEX idx_task_id (taskId),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Sample activities data
INSERT INTO activities_schema (_id, userId, action, taskId, taskTitle, assignedTo, details, timestamp) VALUES
('607f1f77bcf86cd799439001', 'user_2abc123', 'task_created', '507f1f77bcf86cd799439011', 'Implement User Authentication', 'user_2abc123', '{"priority": "high", "dueDate": "2024-02-15"}', '2024-02-01 09:00:00'),
('607f1f77bcf86cd799439002', 'user_2def456', 'task_updated', '507f1f77bcf86cd799439011', 'Implement User Authentication', 'user_2abc123', '{"field": "progress", "oldValue": 50, "newValue": 75}', '2024-02-05 14:30:00'),
('607f1f77bcf86cd799439003', 'user_2abc123', 'task_created', '507f1f77bcf86cd799439013', 'Create Team Invitation System', 'user_2ghi789', '{"priority": "urgent", "dueDate": "2024-02-20"}', '2024-02-03 11:15:00'),
('607f1f77bcf86cd799439004', 'user_2ghi789', 'comment_added', '507f1f77bcf86cd799439013', 'Create Team Invitation System', 'user_2ghi789', '{"comment": "Working on the email notification system"}', '2024-02-08 16:45:00'),
('607f1f77bcf86cd799439005', 'user_2def456', 'task_created', '507f1f77bcf86cd799439014', 'Implement Real-time Updates', 'user_2jkl012', '{"priority": "medium", "dueDate": "2024-02-25"}', '2024-02-06 10:20:00');

-- Create notifications collection for real-time alerts
CREATE TABLE IF NOT EXISTS notifications_schema (
  _id VARCHAR(24) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  type ENUM('task_assigned', 'task_comment', 'task_completed', 'team_invite', 'deadline_reminder') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  taskId VARCHAR(24),
  fromUserId VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (userId),
  INDEX idx_type (type),
  INDEX idx_read (read),
  INDEX idx_created_at (createdAt)
);

-- Sample notifications data
INSERT INTO notifications_schema (_id, userId, type, title, message, taskId, fromUserId, read, createdAt) VALUES
('707f1f77bcf86cd799439001', 'user_2abc123', 'task_assigned', 'New Task Assigned', 'You have been assigned: Implement User Authentication', '507f1f77bcf86cd799439011', 'user_2def456', FALSE, '2024-02-01 09:05:00'),
('707f1f77bcf86cd799439002', 'user_2ghi789', 'task_assigned', 'New Task Assigned', 'You have been assigned: Create Team Invitation System', '507f1f77bcf86cd799439013', 'user_2abc123', FALSE, '2024-02-03 11:20:00'),
('707f1f77bcf86cd799439003', 'user_2abc123', 'task_comment', 'New Comment', 'user_2ghi789 commented on: Create Team Invitation System', '507f1f77bcf86cd799439013', 'user_2ghi789', TRUE, '2024-02-08 16:50:00'),
('707f1f77bcf86cd799439004', 'user_2jkl012', 'task_assigned', 'New Task Assigned', 'You have been assigned: Implement Real-time Updates', '507f1f77bcf86cd799439014', 'user_2def456', FALSE, '2024-02-06 10:25:00'),
('707f1f77bcf86cd799439005', 'user_2abc123', 'deadline_reminder', 'Task Deadline Approaching', 'Implement User Authentication is due in 2 days', '507f1f77bcf86cd799439011', NULL, FALSE, '2024-02-13 09:00:00');

-- Create time_tracking collection for detailed time logs
CREATE TABLE IF NOT EXISTS time_tracking_schema (
  _id VARCHAR(24) PRIMARY KEY,
  taskId VARCHAR(24) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  duration INT NOT NULL, -- in minutes
  description TEXT,
  startTime DATETIME,
  endTime DATETIME,
  sessionType ENUM('manual', 'timer') DEFAULT 'manual',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (taskId),
  INDEX idx_user_id (userId),
  INDEX idx_created_at (createdAt)
);

-- Sample time tracking data
INSERT INTO time_tracking_schema (_id, taskId, userId, duration, description, startTime, endTime, sessionType, createdAt) VALUES
('807f1f77bcf86cd799439001', '507f1f77bcf86cd799439011', 'user_2abc123', 120, 'Initial setup and configuration', '2024-02-01 10:00:00', '2024-02-01 12:00:00', 'timer', '2024-02-01 12:00:00'),
('807f1f77bcf86cd799439002', '507f1f77bcf86cd799439011', 'user_2abc123', 180, 'Implementing login flow', '2024-02-02 14:00:00', '2024-02-02 17:00:00', 'timer', '2024-02-02 17:00:00'),
('807f1f77bcf86cd799439003', '507f1f77bcf86cd799439012', 'user_2def456', 240, 'Database schema design and implementation', '2024-02-05 09:00:00', '2024-02-05 13:00:00', 'timer', '2024-02-05 13:00:00'),
('807f1f77bcf86cd799439004', '507f1f77bcf86cd799439013', 'user_2ghi789', 300, 'Building invitation system backend', '2024-02-07 10:00:00', '2024-02-07 15:00:00', 'timer', '2024-02-07 15:00:00'),
('807f1f77bcf86cd799439005', '507f1f77bcf86cd799439013', 'user_2ghi789', 180, 'Frontend invitation components', '2024-02-08 13:00:00', '2024-02-08 16:00:00', 'timer', '2024-02-08 16:00:00');

-- Create task_comments collection for detailed comment tracking
CREATE TABLE IF NOT EXISTS task_comments_schema (
  _id VARCHAR(24) PRIMARY KEY,
  taskId VARCHAR(24) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  parentCommentId VARCHAR(24), -- for threaded comments
  mentions JSON, -- array of mentioned user IDs
  attachments JSON, -- array of attachment objects
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_id (taskId),
  INDEX idx_user_id (userId),
  INDEX idx_created_at (createdAt)
);

-- Sample task comments data
INSERT INTO task_comments_schema (_id, taskId, userId, comment, parentCommentId, mentions, attachments, createdAt) VALUES
('907f1f77bcf86cd799439001', '507f1f77bcf86cd799439011', 'user_2abc123', 'Started working on the authentication flow. Setting up Clerk integration.', NULL, '[]', '[]', '2024-02-01 10:30:00'),
('907f1f77bcf86cd799439002', '507f1f77bcf86cd799439011', 'user_2def456', 'Great progress! Let me know if you need help with the database integration.', '907f1f77bcf86cd799439001', '["user_2abc123"]', '[]', '2024-02-01 15:45:00'),
('907f1f77bcf86cd799439003', '507f1f77bcf86cd799439013', 'user_2ghi789', 'Working on the email notification system for invitations. Should be ready for testing soon.', NULL, '[]', '[]', '2024-02-08 16:45:00'),
('907f1f77bcf86cd799439004', '507f1f77bcf86cd799439013', 'user_2abc123', 'Excellent! The invitation flow is looking great. Ready for review.', '907f1f77bcf86cd799439003', '["user_2ghi789"]', '[]', '2024-02-10 09:20:00'),
('907f1f77bcf86cd799439005', '507f1f77bcf86cd799439012', 'user_2def456', 'Database schema is complete and tested. All collections are properly indexed.', NULL, '[]', '[]', '2024-02-10 14:30:00');

-- Create team_analytics collection for performance tracking
CREATE TABLE IF NOT EXISTS team_analytics_schema (
  _id VARCHAR(24) PRIMARY KEY,
  teamId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  tasksCompleted INT DEFAULT 0,
  tasksCreated INT DEFAULT 0,
  timeLogged INT DEFAULT 0, -- in minutes
  commentsAdded INT DEFAULT 0,
  collaborationScore DECIMAL(5,2) DEFAULT 0.00,
  productivityScore DECIMAL(5,2) DEFAULT 0.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_team_id (teamId),
  INDEX idx_user_id (userId),
  INDEX idx_date (date)
);

-- Sample team analytics data
INSERT INTO team_analytics_schema (_id, teamId, userId, date, tasksCompleted, tasksCreated, timeLogged, commentsAdded, collaborationScore, productivityScore, createdAt) VALUES
('a07f1f77bcf86cd799439001', 'team_001', 'user_2abc123', '2024-02-01', 0, 2, 120, 1, 85.5, 78.2, '2024-02-01 23:59:59'),
('a07f1f77bcf86cd799439002', 'team_001', 'user_2def456', '2024-02-01', 1, 1, 240, 1, 92.3, 88.7, '2024-02-01 23:59:59'),
('a07f1f77bcf86cd799439003', 'team_001', 'user_2ghi789', '2024-02-08', 0, 0, 480, 1, 76.8, 82.4, '2024-02-08 23:59:59'),
('a07f1f77bcf86cd799439004', 'team_001', 'user_2abc123', '2024-02-10', 0, 0, 0, 1, 88.9, 75.6, '2024-02-10 23:59:59'),
('a07f1f77bcf86cd799439005', 'team_001', 'user_2def456', '2024-02-10', 1, 0, 0, 1, 94.1, 91.3, '2024-02-10 23:59:59');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_tasks_compound ON team_tasks_schema (assignedTo, status, priority);
CREATE INDEX IF NOT EXISTS idx_activities_compound ON activities_schema (userId, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_compound ON notifications_schema (userId, read, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_time_tracking_compound ON time_tracking_schema (taskId, userId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_comments_compound ON task_comments_schema (taskId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_compound ON team_analytics_schema (teamId, date DESC);

-- Views for common queries
CREATE VIEW IF NOT EXISTS active_tasks_view AS
SELECT 
  t.*,
  p1.firstName as assignedToFirstName,
  p1.lastName as assignedToLastName,
  p1.imageUrl as assignedToImage,
  p2.firstName as createdByFirstName,
  p2.lastName as createdByLastName,
  p2.imageUrl as createdByImage
FROM team_tasks_schema t
LEFT JOIN profiles_schema p1 ON t.assignedTo = p1.userId
LEFT JOIN profiles_schema p2 ON t.createdBy = p2.userId
WHERE t.status != 'completed';

CREATE VIEW IF NOT EXISTS team_productivity_view AS
SELECT 
  teamId,
  DATE(createdAt) as date,
  COUNT(*) as totalTasks,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
  AVG(progress) as avgProgress,
  SUM(JSON_EXTRACT(timeTracking, '$.actual')) as totalTimeLogged
FROM team_tasks_schema
GROUP BY teamId, DATE(createdAt)
ORDER BY date DESC;

-- Stored procedures for common operations
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetTeamTaskStats(IN team_id VARCHAR(255))
BEGIN
  SELECT 
    COUNT(*) as totalTasks,
    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todoTasks,
    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgressTasks,
    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as reviewTasks,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
    AVG(progress) as avgProgress,
    SUM(JSON_EXTRACT(timeTracking, '$.actual')) as totalTimeLogged
  FROM team_tasks_schema 
  WHERE teamId = team_id;
END //

CREATE PROCEDURE IF NOT EXISTS GetUserProductivity(IN user_id VARCHAR(255), IN days INT)
BEGIN
  SELECT 
    DATE(createdAt) as date,
    COUNT(*) as tasksWorked,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as tasksCompleted,
    AVG(progress) as avgProgress
  FROM team_tasks_schema 
  WHERE (assignedTo = user_id OR createdBy = user_id)
    AND createdAt >= DATE_SUB(CURDATE(), INTERVAL days DAY)
  GROUP BY DATE(createdAt)
  ORDER BY date DESC;
END //

DELIMITER ;

-- Triggers for automatic analytics updates
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_analytics_on_task_complete
AFTER UPDATE ON team_tasks_schema
FOR EACH ROW
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO team_analytics_schema (teamId, userId, date, tasksCompleted, collaborationScore, productivityScore)
    VALUES (NEW.teamId, NEW.assignedTo, CURDATE(), 1, 85.0, 80.0)
    ON DUPLICATE KEY UPDATE 
      tasksCompleted = tasksCompleted + 1,
      collaborationScore = (collaborationScore + 85.0) / 2,
      productivityScore = (productivityScore + 80.0) / 2;
  END IF;
END //

CREATE TRIGGER IF NOT EXISTS update_analytics_on_time_log
AFTER INSERT ON time_tracking_schema
FOR EACH ROW
BEGIN
  INSERT INTO team_analytics_schema (teamId, userId, date, timeLogged, productivityScore)
  SELECT t.teamId, NEW.userId, CURDATE(), NEW.duration, 75.0
  FROM team_tasks_schema t WHERE t._id = NEW.taskId
  ON DUPLICATE KEY UPDATE 
    timeLogged = timeLogged + NEW.duration,
    productivityScore = (productivityScore + 75.0) / 2;
END //

DELIMITER ;

-- Final optimization
ANALYZE TABLE team_tasks_schema;
ANALYZE TABLE activities_schema;
ANALYZE TABLE notifications_schema;
ANALYZE TABLE time_tracking_schema;
ANALYZE TABLE task_comments_schema;
ANALYZE TABLE team_analytics_schema;
