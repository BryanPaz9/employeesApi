'use strict'

var express = require('express');
const employeeController = require('../controllers/employee.controller');
const md_auth = require('../middlewares/authenticated');
var api  = express.Router();

api.get('/test', employeeController.test);
api.post('/login', employeeController.login);
api.post('/create',md_auth.ensureAuth,employeeController.create);
api.put('/update/:id',md_auth.ensureAuth,employeeController.update);
api.delete('/delete/:id',md_auth.ensureAuth,employeeController.drop);
api.get('/employees',md_auth.ensureAuth,employeeController.getEmployees);
api.get('/employee/:id',md_auth.ensureAuth, employeeController.getEmployee);

module.exports = api;