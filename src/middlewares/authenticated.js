'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'eS9uu8Y@$&zK';

exports.ensureAuth = function(req,res,next){
    if(!req.headers.authorization){
        return res.status(403).send({message:'The request not have Auth headers.'});
    }
    var token = req.headers.authorization.replace(/['"]+/g,'');
    try {
        var payload = jwt.decode(token, secret);
        if(payload.exp<= moment().unix()){
            return res.status(401).send({messsage:'Token has been expired.'});
        }
    } catch (exception) {
        return res.status(404).send({message:'Token is not valid.'});
    }

    req.employee = payload;
    next();
}