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
    console.log("************************************************************");  
    pool.getConnection((err, connection) => {
        if (err) {
            throw err
        }
        inquirer.prompt({
            type: "list",
            message: "What would you like to do?",
            name: "updateOrView",
            choices: ["View Profile", "Update Profile", "Exit"]
        })
            .then((data) => {
                if (data.updateOrView === "View Profile") {
                    inquirer.prompt({
                        type: "list",
                        message: "How would you like to view profiles?",
                        name: "viewProfiles",
                        choices: ["View All Employees", "View Employees by Department", "View Employees by Manager", "Exit"]
                    })
                        .then((data) => {
                            if (data.viewProfiles === "View All Employees") {
                                viewAllEmployees(connection);
                            }
                            else if (data.viewProfiles === "View Employees by Department") {
                                viewEmployeebyDep(connection);
                            }
                            else if (data.viewProfiles === "View Employees by Manager") {
                                viewEmployeebyManger(connection);
                            }
                            else {
                                connection.release();
                                process.exit();
                            }
                        })
                }
                else if (data.updateOrView === "Update Profile") {
                    inquirer.prompt({
                        type: "list",
                        message: "How would you like to update profiles?",
                        name: "updateProfiles",
                        choices: ["Add to Profile", "Remove From Profile", "Update Profile", "Exit"]
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
                                        addEmployee(connection);
                                    }
                                    else if (answer.AddProfile === "Add Department") {
                                        addDepartment(connection);
                                    }
                                    else if (answer.AddProfile === "Add Roles") {
                                        addRoles(connection);
                                    }
                                    else {
                                        connection.release();
                                        process.exit();
                                    }

                                })
                            }
                            else if (data.updateProfiles === "Remove From Profile") {
                                inquirer.prompt({
                                    type: "list",
                                    message: "What would you like to add to profile:",
                                    name: "removeProfile",
                                    choices: ["Remove Employee", "Remove Department", "Remove Roles", "Exit"]
                                }).then((answer) => {
                                    if (answer.removeProfile === "Remove Employee") {
                                        removeEmployee(connection);
                                    }
                                    else if (answer.removeProfile === "Remove Department") {
                                        removeDepartment(connection);
                                    }
                                    else if (answer.removeProfile === "Remove Roles") {
                                        removeRoles(connection);
                                    }
                                    else {
                                        connection.release();
                                        process.exit();

                                    }

                                })
                            }
                            else if (data.updateProfiles === "Update Profile") {
                                inquirer.prompt({
                                    type: "list",
                                    message: "What would you like to add to profile:",
                                    name: "updateProfile",
                                    choices: ["Update Employee role", "Update Employee Manager", "Exit"]
                                }).then((answer) => {
                                    if (answer.updateProfile === "Update Employee role") {
                                        updateEmployeeRole(connection);
                                    }
                                    else if (answer.updateProfile === "Update Employee Manager") {
                                        updateEmployeeManager(connection);
                                    }
                                    else {
                                        connection.release();
                                        process.exit();

                                    }

                                })
                            }
                            else {
                                connection.release();
                                process.exit();
                            }
                        })
                }
                else {
                    connection.release();
                    process.exit();
                }
            })
    })

}


const viewAllEmployees = function (connection) {
        connection.query("select department.department_name, role.title, role.salary, employee.first_name, employee.last_name, employee.manager_id, employee.id from department, role, employee where department.id = role.department_id and role.id = employee.role_id", (err, data) => {
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
            goBackorExist();
        })
}
const viewEmployeebyDep = function (connection) {
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

}

const viewEmployeebyManger = function (connection) {
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
            //filter duplicate name
            var mangerList = manager.filter((item, i, allItems) => {
                return i == allItems.indexOf(item)
            });

            inquirer.prompt({
                type: "list",
                message: "Please select which manager you are looking for?",
                name: "managerID",
                choices: mangerList,
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
                    }
                    console.table(dataSortByManagerID);
                    connection.release();
                    goBackorExist();
                })
        })
}

const addEmployee = function (connection) {
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
            connection.query("select * from role", (err, data) => {
                if (err) {
                    throw err
                }
                let roleData = [];
                //loop to get mangerlist
                for (let i = 0; i < data.length; i++) {
                    roleData.push(data[i].title);
                }
                inquirer.prompt({
                    type: "list",
                    message: "Enter employee's role",
                    name: "newEmployeeRole",
                    choices: roleData,
                }).then((role) => {
                    for (let i = 0; i < data.length; i++) {
                        if (role.newEmployeeRole === data[i].title) {
                            newRoleID = data[i].id;
                        };
                    }
                    connection.query("select * from employee", (err, result) => {
                        if (err) {
                            throw err
                        }
                        let managerData = ["null"];
                        //loop to get mangerlist
                        for (let i = 0; i < result.length; i++) {
                            managerData.push(result[i].first_name);
                        }
                        inquirer.prompt({
                            type: "list",
                            message: "Enter employee's manager",
                            name: "newEmployeeManager",
                            choices: managerData,
                        }).then((manager) => {
                            if (manager.newEmployeeManager !== "null") {
                                for (let i = 0; i < result.length; i++) {
                                    if (manager.newEmployeeManager === result[i].first_name) {
                                        newEmployeeManagerID = result[i].id - 1;
                                    }
                                }
                                connection.query(`insert into employee (first_name, last_name, role_id, manager_id) values ("${name.newEmployeeFirstName}", "${name.newEmployeeLastName}", ${newRoleID}, ${newEmployeeManagerID})`, (err) => {
                                    if (err) {
                                        throw err
                                    }
                                    console.log("Adding to profile...");
                                    console.log("Done!");
                                    connection.release();
                                    goBackorExist();
                                })
                            }
                            else if (manager.newEmployeeManager === "null") {
                                connection.query(`insert into employee (first_name, last_name, role_id) values ("${name.newEmployeeFirstName}", "${name.newEmployeeLastName}", ${newRoleID})`, (err) => {
                                    if (err) {
                                        throw err
                                    }
                                    console.log("Adding to profile...");
                                    console.log("Done!");
                                    connection.release();
                                    goBackorExist();
                                })
                            }
                        })
                    })
                })
            })
    })
}
      
const addDepartment = function (connection) {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter department that you want to create:",
            name: "newDepartmentName"
        },
    ]).then((name) => {
      
            connection.query(`insert into department (department_name) values ("${name.newDepartmentName}")`, (err, data) => {
                if (err) {
                    throw err
                }
                console.log("Adding New Department...Done!");
                connection.release();
                goBackorExist();
            })
        })
}

const addRoles = function (connection) {

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
}

const removeEmployee = function (connection) {
        connection.query("select employee.first_name from employee", (err, data) => {
            if (err) {
                throw err
            }
            let removeList = [];
            for (let i = 0; i < data.length; i++) {
                removeList.push(data[i].first_name);
            }
            //filter duplicate names
            let removeEmployeeList = removeList.filter((item, i, allItems) => {
                return i == allItems.indexOf(item)
            });
            inquirer.prompt({
                type: "list",
                message: "Please select which employee info you want to remove!",
                name: "removeemployee",
                choices: removeEmployeeList,
            }).then((answer) => {
                console.log(`${answer.removeemployee} is removed!`);
                connection.query(`delete from employee where employee.first_name = "${answer.removeemployee}"`);
                connection.release();
                goBackorExist();
            })

        })
}

const removeDepartment = function (connection) {
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
                console.log(`${answer.removeDepartment} department is removed!`);
                connection.query(`delete from department where department.department_name = "${answer.removeDepartment}"`);
                connection.release();
                goBackorExist();
            })
    })
}

const removeRoles = function (connection) {
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
                console.log(`${answer.removeRole} position is removed!`);
                connection.query(`delete from role where role.title = "${answer.removeRole}"`);
                connection.release();
                goBackorExist();
            })

        })
}
const updateEmployeeRole = function (connection) {
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

}
const updateEmployeeManager = function (connection) {
        connection.query("select * from employee", (err, data) => {
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
                name: "employeeName",
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
                        newManagerId = data[i].id - 1;
                }
                connection.query(`update employee set employee.manager_id =${newManagerId} where employee.first_name = "${employee.employeeName}"`, (err) => {
                    if (err) {
                        throw err
                    }
                    console.log("Updated Employee's manager!");
                    connection.release();
                    goBackorExist();
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