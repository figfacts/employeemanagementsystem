// dependencies
const figlet = require('figlet');                 // Used to display the intro 'EMS' screen
const consoleTable = require('console.table');   // Used for output to print MySQL rows to the console
const dotEnv = require('dotenv').config();      // Used for dotenv file
const inquirer = require('inquirer');          // Used for npm prompts interact with the user via the command-line
const mysql = require('mysql');               // Used to access MySQL database

// Creates the connection to the mySQL Database "employees"
const connection = mysql.createConnection({
    host: "localhost",
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


//EMS intro screen
intro();
function intro() {
  console.log(
    figlet.textSync("EMS", {
      font: "isometric3",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 60,
      whitespaceBreak: true,
    })
  );
  console.log("\n Employee Management System\n");
}


// Starts the menu
function menu() {
    inquirer.prompt({
        name: "answers",
        type: "list",
        message: "Welcome to EMS! Please select an an option below:",
        choices:
            [
                "Add Employee",
                "Add Department",
                "Add Role",
                "View All Employees",
                "View All Roles",
                "View All Departments",
                "Remove Employee",
                "Quit"
            ]
    })
        .then((response) => {
            switch (response.answers) {
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "View All Roles":
                    viewAllRoles();
                    break;
                case "View All Departments":
                    viewAllDepartments();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Quit":
                    connection.end();
                    break;
            }
        });
}

//Adds a new employee
function addEmployee() {
    let managerId = 0;
    connection.query("SELECT manager_id FROM employee;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            if (res[i].manager_id != null && managerId < res[i].manager_id) {
                managerId = res[i].manager_id;
            }
        }
    });
    let roles = [];
    connection.query("SELECT title FROM role;", function (err, res) {
        if (err) throw (err);
        for (let i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    });
    // Info question prompt for the new employee
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Please enter the first name of the new hire.",
        },
        {
            name: "last_name",
            type: "input",
            message: "Please enter the last name of the new hire.",
        },
        {
            name: "role",
            type: "list",
            message: "What is the new-hire's role(position?)",
            choices: roles,
        },
        {
            name: "manager",
            type: "list",
            message: "Is the new-hire a manager?",
            choices: ["No", "Yes"],
        }])
        .then((response) => {
            let roleId;
            connection.query("SELECT id, title FROM role;", function (err, res) {
                if (err) throw (err);
                for (let i = 0; i < res.length; i++) {
                    if (res[i].title == response.role) {
                        roleId = res[i].id;
                    }
                }
                if (response.manager == "Yes") {
                    managerId++;
                    response.manager = managerId;
                } else {
                    response.manager = null;
                }
                connection.query("INSERT INTO employee SET ?",
                    {
                        first_name: response.first_name,
                        last_name: response.last_name,
                        role_id: roleId,
                        manager_id: response.manager,
                    },
                    function (err, res) {
                        if (err) throw (err);
                        console.log(`Added ${response.first_name}${" "}${response.last_name}!`);
                        menu();
                    }
                );
            });
        });
}
// Add a new department
function addDepartment() {
    // prompts to ask the user what new department to add
    inquirer.prompt(
        {
            name: "addDepartment",
            type: "input",
            message: "What is the department you want to add?",
        })
        .then((response) => {
            connection.query("INSERT INTO department SET ?",
                {
                    name: response.addDepartment,
                },
                function (err, res) {
                    if (err) throw (err);
                });
            console.log(`You have successfully added ${response.addDepartment}.`);
            menu();
        });
}

//Add a new role
function addRole() {
    let departments = [];
    connection.query("SELECT name FROM department;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        inquirer.prompt([
            {
                name: "deptId",
                type: "list",
                message: "What department will this role be in?",
                choices: departments,
            },
            {
                name: "newRole",
                type: "input",
                message: "What is the name of the new role you would like to add?",
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for this new role?",
            },
        ])
            .then((response) => {
                connection.query(`SELECT id, name FROM department;`, function (err, res) {
                    if (err) throw err;
                    res.forEach((department) => {
                       
                        if (department.name == response.deptId) {
                            response.deptId = department.id;
                        }
                    });
                    // creates a new role in db
                    connection.query(`INSERT INTO role SET ?`,
                        {
                            title: response.newRole,
                            salary: response.salary,
                            department_id: response.deptId,
                        },
                        function (err, res) {
                            if (err) throw err;
                        }
                    );
                    console.log(`Successfully added ${response.newRole}!`);
                    menu();
                });
            });
    });
}

// VIEW ALL
// Employees
function viewAllEmployees() {
    connection.query(
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id
         FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN department ON department.id=role.department_id
         ORDER BY employee.id asc;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
            menu();
        }
    );
}
//Departments
function viewAllDepartments() {
    connection.query(`SELECT * FROM department ORDER BY id asc;`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    menu();
}
// Roles
function viewAllRoles() {
    connection.query(`SELECT * FROM role`,
        function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    menu();
}
//Remove/Delete an employee
function removeEmployee() {
    connection.query("SELECT id, concat(first_name, ' ', last_name) fullName FROM employee",
        function (err, res) {
            if (err) throw err;
            let employees = res.map((employee) => employee.fullName);
        inquirer.prompt({
            name: "removeEmployee",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: employees,
        })
            .then((response) => {
                connection.query(
                    `DELETE FROM employee 
                      WHERE id and concat(first_name, ' ', last_name) ="${response.removeEmployee}"`,
                    function (err, res) {
                        if (err) throw err;
                        console.log(`${response.removeEmployee} has been removed`);
                        menu();
                    }
                );
            });
    }
    );
}

connection.connect(function (err) {
    if (err) throw (err);
    menu();
});