'use strict'
const MONGOOSE = require('mongoose');
var Schema = MONGOOSE.Schema;

var EmployeeSchema = Schema({
    code : String,
    firstName: String,
    middleName: String,
    lastName : String,
    email: String,
    password: String,
    age: Number,
    profileImage: String,
    role: String
});
module.exports = MONGOOSE.model('Employee',EmployeeSchema);