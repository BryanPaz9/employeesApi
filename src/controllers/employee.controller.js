'use strict'

var Employee = require('../models/employee.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function test(req,res){
    res.status(200).send({messsage:'Test message'});
}

function create(req,res){
    var employee = new Employee();
    var params = req.body;

    if(params.code && params.firstName && params.middleName && params.lastName && params.email && params.password && params.age){
        employee.code = params.code;
        employee.firstName = params.firstName;
        employee.middleName = params.middleName;
        employee.lastName = params.lastName;
        employee.email = params.email;
        employee.age = params.age;
        employee.role = 'REGULAR';
        employee.image = null;

        Employee.find({$or:[
            {email: params.email.toLowerCase()},
            {code : params.code.toLowerCase()}
        ]}).exec((err,employees)=>{
            if(err) return res.status(500).send({message: 'Error on request.'});
            if(employees && employees.length>=1){
                return res.status(500).send({message:'Employee is already registered.'});
            }else{
                bcrypt.hash(params.password,null,null,(err,hash)=>{
                    employee.password = hash;
                    employee.save((err,employeeStored)=>{
                        if(err) return res.status(500).send({message:'Save failed.'});
                        if(employeeStored){
                            return res.status(200).send({employee:employeeStored});
                        }else{
                            return res.status(404).send({message:'Employee was not saved'});
                        }
                    });
                });
            }
        });
    }else{
        res.status(200).send({message:'Complete all require fields.'});
    }
}

function update(req,res){
    var employeeId = req.params.id;
    var update = req.body;
    delete update.password;

    if(employeeId != req.employee.sub){
        return res.status(500).send({message:'Not have permission for update this employee.'});
    }

    Employee.find({$or:[
        {email: update.email.toLowerCase()},
        {code: update.code}
    ]}).exec((err, employees) =>{
        var employeeIsset = false;
        employees.forEach((employee) => {
            if(employee  && employee._id != employeeId) employeeIsset = true;
        });

        if(employeeIsset) return res.status(404).send({message:'Data is in use.'});
        Employee.findByIdAndUpdate(employeeId,update,{new:true},(err,employeeUpdated)=>{
            if(err) return res.status(500).send({message: 'Error on the request.'});
            if(!employeeUpdated) return res.status(500).send({messsage:'It was not possible to update the employee.'});
            return res.status(200).send({employee: employeeUpdated});
        });
    })
    
}

function drop (req,res){
    var employeeId = req.params.id;
    if(employeeId != req.employee.sub){
        return res.status(500).send({message:'Not have permission for delete this employee.'});
    }
    Employee.findByIdAndDelete(employeeId, (err,employeeDeleted)=>{
        if(err) return res.status(500).send({message: 'Request error.'});
        if(!employeeDeleted) return res.status(500).send({message:'Failed to delete employee'});
        return res.status(200).send({message:'Employee deleted sucessful'});
    })
}

function login (req,res){
    var params = req.body;

    Employee.findOne({email: params.email},(err,employee)=>{
        if(err) return res.status(500).send({message:'Request error.'});
        if(employee){
            bcrypt.compare(params.password, employee.password,(err,gettoken)=>{
                if(gettoken){
                    if(params.gettoken){
                        return res.status(200).send({
                            token:jwt.createToken(employee)
                        })
                    }else{
                        employee.password = undefined;
                        return res.status(200).send({employee});
                    }
                }else{
                    return res.status(404).send({message:'Employee could not be identified.'});
                }
            });
        }else{
            return res.status(404).send({message:'Employee could not be login in.'})
        }
    });
}

function signUp(req,res){
    var params = req.body;
    var employee = new Employee();
    if(params.code && params.firstName && params.lastName && params.email && params.password){
        employee.code = params.code;
        employee.firstName = params.firstName;
        employee.lastName = params.lastName;
        employee.email = params.email;
        
        Employee.find({$or:[
            {email: params.email.toLowerCase()},
            {code: params.code.toLowerCase()}
        ]}).exec((err, employees) =>{
            if(err) return res.status(500).send({message:'Request error.'});
            if(employees && employees.length >=1){
                return res.status(404).send({message:'Employee is already registered.'});
            }else{
                bcrypt.hash(params.password,null,null,(err,hash)=>{
                    employee.password = hash;
                    employee.save((err,employeeRegistered) =>{
                        if(err) return res.status(500).send({message:'Save failed.'});
                        if(employeeRegistered){
                            return res.status(200).json({employee:employeeRegistered,token:jwt.createToken(employeeRegistered)});
                        }else{
                            return res.status(404).send({message:'Could not be registered.'})
                        }
                    })
                })
            }

        })
    }else{
        return res.status(500).send({message:'Complete all fields.'})
    }
}

function getEmployees(req,res){
    Employee.find((err,employees)=>{
        if(err) return res.status(500).send({message:'Request error.'});
        if(!employees) return res.status(404).send({message:'Query error'});
        return res.status(200).send({employees});
    });   
}

function getEmployee(req,res){
    var employeeId = req.params.id;
    Employee.findById(employeeId,(err,employee)=>{
        if(err) return res.status(500).send({message:'Request error.'});
        if(!employee) return res.status(404).send({message:'Employee not found.'});
        return res.status(200).send({employee});
    })
}

module.exports ={
    test,
    create,
    update,
    drop,
    login,
    getEmployees,
    getEmployee,
    signUp

};