-- This is an empty migration.

-- Update IT department
UPDATE Department
SET managerId = 2
WHERE name = 'IT';

-- Update HR department
UPDATE Department
SET managerId = 3
WHERE name = 'HR';

-- Update Customer Service department
UPDATE Department
SET managerId = 3
WHERE name = 'Customer Service';

-- Update Training department
UPDATE Department
SET managerId = 2
WHERE name = 'Training';

-- Update Cyber Security department
UPDATE Department
SET managerId = 2
WHERE name = 'Cyber Security';
