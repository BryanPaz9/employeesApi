'use strict'

var jwt  = require('jwt-simple');
var moment = require('moment');
var secret = 'eS9uu8Y@$&zK';

exports.createToken = function (employee){
    var payload = {
        sub: employee._id,
        code : employee.code,
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName : employee.lastName,
        email: employee.email,
        age : employee.age,
        profileImage: employee.profileImage,
        role: employee.role,
        iat: moment().unix(),
        exp: moment().day(30, 'days').unix()

    }
    return jwt.encode(payload,secret);
}