ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
drop database if exists employee_infoDB;
create database employee_infoDB;
use employee_infoDB;
create table department(
id int auto_increment not null,
primary key(id),
department_name varchar(30) not null
);
create table role(
id int auto_increment not null,
primary key(id),
title varchar(30) not null,
salary decimal(8,2) not null,
department_id int not null
);
create table employee(
id int auto_increment not null,
primary key(id),
first_name varchar(30) not null,
last_name varchar(30),
role_id int not null,
manager_id int
);

insert into department (department_name)
values ("Finance"), ("Engineer"),("Marketing");

insert into role(title, salary, department_id)
values("Manager", 99999.99, 1),("Team Leader", 110000.00, 2), ("Sales", 88888.88, 3), ("Accounting", 88888.88, 1),("Engineer", 99999.99, 2);

insert into employee (first_name, last_name, role_id)
values ("Jason","Miller", 1),("Kevin","White", 1),("Peter","Lee",2);

insert into employee (first_name, last_name, role_id, manager_id)
values("Daniel","Yang",3,1),("John","Smith",5,2),("Austin","Green",4,1);




select * from department;
select * from role;
select * from employee;

alter table employee
add manager varchar(30);
update employee set manager = employee.first_name where manager_id in (id);




