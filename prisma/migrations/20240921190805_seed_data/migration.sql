INSERT INTO Department (name, status) VALUES ('IT', true);
INSERT INTO Department (name, status) VALUES ('HR', true);
INSERT INTO Department (name, status) VALUES ('Customer Service', true);
INSERT INTO Department (name, status) VALUES ('Training', true);
INSERT INTO Department (name, status) VALUES ('Cyber Security', true);

-- Retrieve Department IDs for use in employee insertions
WITH dept_ids AS (
    SELECT id FROM Department WHERE name = 'IT' LIMIT 1
), hr_ids AS (
    SELECT id FROM Department WHERE name = 'HR' LIMIT 1
), cs_ids AS (
    SELECT id FROM Department WHERE name = 'Customer Service' LIMIT 1
), tr_ids AS (
    SELECT id FROM Department WHERE name = 'Training' LIMIT 1
), cyber_ids AS (
    SELECT id FROM Department WHERE name = 'Cyber Security' LIMIT 1
)

-- Seed Employees
-- Admin User
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status)
VALUES ('hradmin@test.com', 'TestPass1234', 'SUPER', 'USER', '000 000 0000', 0, true);

-- Bob Ross
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status)
VALUES ('bob@gmail.com', 'Password123#', 'Bob', 'Ross', '123 455 7891', 1, true);

-- Steve Jobs
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status)
VALUES ('steveJobs@apple.com', 'Password123#', 'Steve', 'Jobs', '678 567 7394', 1, true);

-- Danny Danniel
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('danny@gmail.com', 'Password123#', 'Danny', 'Danniel', '123 455 9341', 2, true,
    (SELECT id FROM Employee WHERE email = 'bob@gmail.com'));

-- Bruce Banner
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('banner@yahoo.com', 'Password123#', 'Bruce', 'Banner', '739 834 8392', 2, true,
    (SELECT id FROM Employee WHERE email = 'bob@gmail.com'));

-- Steve Rodgers
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('rodgers@gamil.com', 'Password123#', 'Steve', 'Rodgers', '123 894 7891', 2, true,
    (SELECT id FROM Employee WHERE email = 'steveJobs@apple.com'));

-- Damian Wayne
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('damian@yahoo.com', 'Password123#', 'Damian', 'Wayne', '278 273 2784', 2, true,
    (SELECT id FROM Employee WHERE email = 'bob@gmail.com'));

-- Barry Allen
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('Barry@gmail.com', 'Password123#', 'Barry', 'Allen', '903 455 7891', 2, true,
    (SELECT id FROM Employee WHERE email = 'steveJobs@apple.com'));

-- Tony Stark
INSERT INTO Employee (email, password, firstName, lastName, telephone, role, status, managerId)
VALUES ('tony@gmail.com', 'Password123#', 'Tony', 'Stark', '273 743 9038', 2, true,
    (SELECT id FROM Employee WHERE email = 'steveJobs@apple.com'));

-- Link employees to departments
-- Linking Bob Ross
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'bob@gmail.com'), (SELECT id FROM Department WHERE name = 'IT')),
  ((SELECT id FROM Employee WHERE email = 'bob@gmail.com'), (SELECT id FROM Department WHERE name = 'Cyber Security')),
  ((SELECT id FROM Employee WHERE email = 'bob@gmail.com'), (SELECT id FROM Department WHERE name = 'Training'));

-- Linking Steve Jobs
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'steveJobs@apple.com'), (SELECT id FROM Department WHERE name = 'HR')),
  ((SELECT id FROM Employee WHERE email = 'steveJobs@apple.com'), (SELECT id FROM Department WHERE name = 'Customer Service'));

-- Linking Danny Danniel
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'danny@gmail.com'), (SELECT id FROM Department WHERE name = 'IT'));

-- Linking Bruce Banner
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'banner@yahoo.com'), (SELECT id FROM Department WHERE name = 'IT')),
  ((SELECT id FROM Employee WHERE email = 'banner@yahoo.com'), (SELECT id FROM Department WHERE name = 'Cyber Security'));

-- Linking Steve Rodgers
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'rodgers@gamil.com'), (SELECT id FROM Department WHERE name = 'HR')),
  ((SELECT id FROM Employee WHERE email = 'rodgers@gamil.com'), (SELECT id FROM Department WHERE name = 'Customer Service'));

-- Linking Damian Wayne
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'damian@yahoo.com'), (SELECT id FROM Department WHERE name = 'Training'));

-- Linking Barry Allen
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'Barry@gmail.com'), (SELECT id FROM Department WHERE name = 'Customer Service'));

-- Linking Tony Stark
INSERT INTO EmployeeDepartment  
VALUES 
  ((SELECT id FROM Employee WHERE email = 'tony@gmail.com'), (SELECT id FROM Department WHERE name = 'HR'));