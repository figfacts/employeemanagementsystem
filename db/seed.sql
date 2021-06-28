-- Seed data to see initial sample data in the employees database 
 
 use employees;

 INSERT INTO department
    (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

 INSERT INTO role 
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

    INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
    VALUES
        ('Michael', 'Jordan', 1, NULL),
        ('Lebron', 'James', 2, 1),
        ('Kobe', 'Bryant', 3, NULL),
        ('Kevin', 'Durant', 4, 3),
        ('Jeremy', 'Lin', 5, NULL),
        ('Donovan', 'Mitchell', 6, 5),
        ('Stephen', 'Curry', 7, NULL),
        ('Damian', 'Lillard', 8, 7);


