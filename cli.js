const mysql = require('mysql');
const inquirer = require('inquirer');
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_infoDB'
})

const init = function () {
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        name: "updateOrView",
        choices: ["View Profile", "Update Profile"]
    })
        .then((data) => {
            if (data.updateOrView === "View Profile") {
                inquirer.prompt({
                    type: "list",
                    message: "How would you like to view profiles?",
                    name: "viewProfiles",
                    choices: ["View All Employees", "View Employees by Department", "View Employees by Manager"]
                })
                    .then((data) => {
                        if (data.viewProfiles === "View All Employees") {
                            viewAllEmployees();
                        }
                        else if (data.viewProfiles === "View Employees by Department") {
                            viewEmployeebyDep();
                        }
                        else if (data.viewProfiles === "View Employees by Manager") {
                            viewEmployeebyManger();
                        }

                    })
            }
            else if (data.updateOrView === "Update Profile") {
                inquirer.prompt({
                    type: "list",
                    message: "How would you like to update profiles?",
                    name: "updateProfiles",
                    choices: ["Add to Profile", "Remove From Profile", "Update Profile"]
                })
                    .then((data) => {
                        if (data.updateProfiles === "Add to Profile") {
                            inquirer.prompt({
                                type: "list",
                                message: "What would you like to add to profile:",
                                name: "AddProfile",
                                choices: ["Add Employee", "Add Department", "Add Roles"]
                            }).then((answer) => {
                                if (answer.AddProfile === "Add Employee") {
                                    addEmployee();
                                }
                                else if (answer.AddProfile === "Add Department") {
                                    addDepartment();
                                }
                                else if (answer.AddProfile === "Add Roles") {
                                    addRoles();
                                }

                            })
                        }
                        else if (data.updateProfiles === "Remove From Profile") {
                            inquirer.prompt({
                                type: "list",
                                message: "What would you like to add to profile:",
                                name: "removeProfile",
                                choices: ["Remove Employee", "Remove Department", "Remove Roles"]
                            }).then((answer) => {
                                if (answer.removeProfile === "Remove Employee") {
                                    removeEmployee();
                                }
                                else if (answer.removeProfile === "Remove Department") {
                                    removeDepartment();
                                }
                                else if (answer.removeProfile === "Remove Roles") {
                                    removeRoles();
                                }

                            })
                        }
                        else if (data.updateProfiles === "Update Profile") {
                            inquirer.prompt({
                                type: "list",
                                message: "What would you like to add to profile:",
                                name: "updateProfile",
                                choices: ["Update Employee role", "Update Employee Manager"]
                            }).then((answer) => {
                                if (answer.updateProfile === "Update Employee role") {
                                    updateEmployeeRole();
                                }
                                else if (answer.updateProfile === "Update Employee Manager") {
                                    updateEmployeeManager();
                                }

                            })
                        }
                    })
            }
        })

}


const viewAllEmployees = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select department.department_name, role.title, role.salary, employee.first_name, employee.last_name, employee.manager_id from department, role, employee where department.id = role.department_id and role.id = employee.role_id", (err, data) => {
            if (err) {
                throw err
            }
            //loop to get manager name by manager id
            for (let i = 0; i < data.length; i++) {
                if (data[i].manager_id !== null) {
                    let manager = data[data[i].manager_id].first_name;
                    data[i].manager_id = manager;
                }
            }
            console.table(data);
            connection.release();
            goBackorExist();
        })
    })
}
const viewEmployeebyDep = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }

        connection.query("select department.department_name from department", (err, data) => {
            let departments = [];
            if (err) {
                throw err
            }
            //loop to get department names for inquirer choices
            for (let i = 0; i < data.length; i++) {
                departments.push(data[i].department_name);
            }
            inquirer.prompt({
                type: "list",
                message: "Please select which department your are looking for?",
                name: "department",
                choices: departments,
            })
                .then((answer) => {
                    connection.query("select department.department_name, role.title, role.salary, employee.first_name, employee.last_name, employee.manager_id from department, role, employee where department.id = role.department_id and role.id = employee.role_id", (err, data) => {
                        let dataSortByDep = [];
                        if (err) {
                            throw err
                        }
                        for (let i = 0; i < data.length; i++) {
                            if (answer.department === data[i].department_name) {
                                dataSortByDep.push(data[i]);
                            }
                            
                        }
                        //loop to get mangername by managerID
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].manager_id !== null) {
                                let manager = data[data[i].manager_id].first_name;
                                data[i].manager_id = manager;
                            }
                        }

                        console.table(dataSortByDep);
                        connection.release();
                        goBackorExist();
                    })
                })
        })
    })

}

const viewEmployeebyManger = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select department.department_name, role.title, role.salary, employee.first_name, employee.last_name, employee.manager_id from department, role, employee where department.id = role.department_id and role.id = employee.role_id", (err, data) => {
            let manager = [];
            if (err) {
                throw err
            }
            //loop to get mangername by managerID
            for (let i = 0; i < data.length; i++) {
                if (data[i].manager_id !== null) {
                    data[i].manager_id = data[data[i].manager_id].first_name;
                    manager.push(data[i].manager_id);
                }
            }

            inquirer.prompt({
                type: "list",
                message: "Please select which manager you are looking for?",
                name: "managerID",
                choices: manager,
            })
                .then((answer) => {
                    let dataSortByManagerID = [];
                    if (err) {
                        throw err
                    }

                    for (let i = 0; i < data.length; i++) {
                        if (answer.managerID == data[i].manager_id) {
                            dataSortByManagerID.push(data[i]);
                        }
                        else {
                            console.log(`We don't have ${answer.manager} manager!`);
                        }
                    }
                    console.table(dataSortByManagerID);
                    connection.release();
                    goBackorExist();
                })
        })
    })
}

const addEmployee = function () {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter employee's first name",
            name: "newEmployeeFirstName"
        },
        {
            type: "input",
            message: "Enter employee's last name",
            name: "newEmployeeLastName"
        },

    ]).then((name) => {
        pool.getConnection((err, connection) => {
            if (err) {
                throw err
            }
            connection.query("select role.title, role.id, role.department_id from role", (err, data) => {
                let roleData = [];
                if (err) {
                    throw err
                }
                for (let i = 0; i < data.length; i++) {
                    roleData.push(data[i].title);
                }
                inquirer.prompt([{
                    type: "list",
                    message: "Enter employee's role",
                    name: "newEmployeeRole",
                    choices: roleData,
                }, {
                    type: "input",
                    message: "Enter employee's manager ID",
                    name: "newEmployeeManagerID"
                }
                ]).then((IDinfo) => {
                    let newEmployeeID = "";
                    connection.query("select * from role", (err, depdata) => {
                        if (err) {
                            throw err
                        }
                        for (let i = 0; i < depdata.length; i++) {
                            if (IDinfo.newEmployeeRole === depdata[i].title) {
                                newEmployeeID = depdata[i].id
                            }
                        }
                        connection.query(`insert into employee (first_name, last_name, role_id, manager_id) values("${name.newEmployeeFirstName}","${name.newEmployeeLastName}", ${newEmployeeID}, ${IDinfo.newEmployeeManagerID})`);
                        console.log("Adding to profile...");
                        console.log("Done!");
                        connection.release();
                        goBackorExist();
                    })
                })

            })
        })
    })
}
const addDepartment = function () {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter department that you want to create:",
            name: "newDepartmentName"
        },
    ]).then((name) => {
        pool.getConnection((err, connection) => {
            if (err) {
                throw err
            }
            connection.query(`insert into department (department_name) values ("${name.newDepartmentName}")`, (err, data) => {
                if (err) {
                    throw err
                }
                console.log("Adding New Department...Done!");
                connection.release();
                goBackorExist();
            })
        })
    })
}

const addRoles = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        
        connection.query("select department_name, id from department", (err, data) => {
            let departmentsList = [];
            for (let i = 0; i < data.length; i++) {
                departmentsList.push(data[i].department_name);
            }
        
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter role that you want to create:",
                    name: "newRole"
                },
                {
                    type: "input",
                    message: "Enter salary of role that you created:",
                    name: "newSalary"
                },
                {
                    type: "list",
                    message: "select the department of this role:",
                    name: "newDepartmentOfRole",
                    choices: departmentsList,
                },
            ]).then((answer) => {
                let departmentID = 0;
                for (let i = 0; i < data.length; i++) {
                    if (answer.newDepartmentOfRole === data[i].department_name) {
                        departmentID = data[i].id
                    }
                }
                connection.query(`insert into role(title, salary, department_id) values ("${answer.newRole}", ${answer.newSalary}, "${departmentID}")`, (err, data) => {
                    if (err) {
                        throw err
                    }
                    console.log("Adding new role ... done!");
                    connection.release();
                    goBackorExist();
                })
            })
        })
    })
}

const removeEmployee = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select employee.first_name from employee", (err, data) => {
            if (err) {
                throw err
            }
            let removeList = [];
            for (let i = 0; i < data.length; i++) {
                removeList.push(data[i].first_name);
            }
            inquirer.prompt({
                type: "list",
                message: "Please select which employee info you want to remove!",
                name: "removeemployee",
                choices: removeList,
            }).then((answer) => {
                console.log(`${answer.removeemployee} is removed!`);
                connection.query(`delete from employee where employee.first_name = "${answer.removeemployee}"`);
                connection.release();
                goBackorExist();
            })

        })
    })
}

const removeDepartment = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select department_name from department", (err, data) => {
            if (err) {
                throw err
            }
            let departmentList = [];
            for (let i = 0; i < data.length; i++) {
                departmentList.push(data[i].department_name);
            }
            inquirer.prompt({
                type: "list",
                message: "Please select which department you want to remove!",
                name: "removeDepartment",
                choices: departmentList,
            }).then((answer) => {
                console.log(`${answer.removeDepartment} is removed!`);
                connection.query(`delete from department where department.department_name = "${answer.removeDepartment}"`);
                connection.release();
                goBackorExist();
            })

        })
    })
}

const removeRoles = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select title from role", (err, data) => {
            if (err) {
                throw err
            }
            let roleList = [];
            for (let i = 0; i < data.length; i++) {
                roleList.push(data[i].title);
            }
            inquirer.prompt({
                type: "list",
                message: "Please select which role you want to remove!",
                name: "removeRole",
                choices: roleList,
            }).then((answer) => {
                console.log(`${answer.removeRole} is removed!`);
                connection.query(`delete from role where role.title = "${answer.removeRole}"`);
                connection.release();
                goBackorExist();
            })

        })
    })
    
}
const updateEmployeeRole = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select title, role.id, employee.first_name, employee.last_name, employee.role_id from role, employee where role.id = employee.role_id", (err, data) => {
            if (err) {
                throw err
            }
            let nameList = [];
            for (let i = 0; i < data.length; i++) {
                nameList.push(data[i].first_name);
            }
            inquirer.prompt({
                type: "list",
                message: "Please select which employee you want to update role!",
                name: "employeeUpdateRoleName",
                choices: nameList,
            }).then((employee) => {
                let roleList = [];
                for (let i = 0; i < data.length; i++) {
                    if (roleList[i - 1] !== data[i].title) {
                        roleList.push(data[i].title);
                    }
                }
                inquirer.prompt({
                    type: "list",
                    message: "Please select which role!",
                    name: "UpdateRole",
                    choices: roleList,
                }).then((role) => {
                    //loop to assign roleID by selected role name
                    for (let i = 0; i < data.length; i++) {
                        if (role.UpdateRole === data[i].title) {
                            let newRoleId = data[i].id;
                            data[i].id = newRoleId;
                            connection.query(`update employee set employee.role_id =${newRoleId} where employee.first_name = "${employee.employeeUpdateRoleName}"`, (err) => {
                                if (err) {
                                    throw err
                                }
                                console.log("Updated Employee's role!");
                                connection.release();
                                goBackorExist();
                            })
                        }
                    }
                })

            })
        })
    })

}
const updateEmployeeManager = function () {
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        connection.query("select id, employee.first_name, employee.last_name, employee.manager_id from employee", (err, data) => {
            if (err) {
                throw err
            }
            let nameList = [];
            for (let i = 0; i < data.length; i++) {
                nameList.push(data[i].first_name);
            }
            inquirer.prompt([{
                type: "list",
                message: "Please select which employee you want to update!",
                name: "employeeUpdateManagerName",
                choices: nameList,
            },
            {
                type: "list",
                message: "Please select which manager you want to update to this employee!",
                name: "employeeUpdateManager",
                choices: nameList,
                }]).then((employee) => {
                    let newManagerId = 0;
                //loop to assign manager by selected employee's name
                for (let i = 0; i < data.length; i++) {
                    if (employee.employeeUpdateManager === data[i].first_name)
                        newManagerID = data[i].id;
                }
                connection.query(`update employee set employee.manager_id =${newManagerId} where employee.first_name = "${employee.employeeUpdateManagerName}"`, (err) => {
                    if (err) {
                        throw err
                    }
                    console.log("Updated Employee's manager!");
                    connection.release();
                    goBackorExist();
                })
            })
        })
    })
}
const goBackorExist = function () {
    inquirer.prompt({
        type: "list",
        message: "Go Back or Exit?",
        name: "goBackOrExit",
        choices: ["Go Back", "Exit"],
    })
        .then((answer) => {
            if (answer.goBackOrExit === "Exit") {
                process.exit();
            }
            else {
                init();
            }

        })
}
init();