'use strict'

const MONGOOSE = require('mongoose');
const APP = require('./app');
const PORT = 3000;
const {spawn} = require('child_process');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const DB_NAME = 'App';



MONGOOSE.Promise = global.Promise
MONGOOSE.connect('mongodb://localhost:27017/App', {useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('Connection of App DB was sucessful');
    APP.listen(PORT, function (){
        console.log('Server is running on port: '+PORT);
    });
}).catch(err => console.log(err));

//cron.schedule('0 0 * * SUN',()=>dbBackup()); // windows
cron.schedule('* 1 * * *', () => dbBackup());
//cron.schedule('0 0 * * SUN *',()=>dbBackup()); // linux
//dbBackup();

function dbBackup(){
    var recordName = DB_NAME+'-BACKUP-'+moment().format('DD-MM-YYYY__h_mm_A').toString();
    const child = spawn('mongodump', [
        
        `--db=${DB_NAME}`,
        `--archive=${path.join(__dirname,'public/back',`${recordName}.gzip`)}`,
        //`--archive=${path.join('C:/Users/Admin/Desktop',`${recordName}.gzip`)}`,
        '--gzip',
      ]);

    child.stdout.on('data',(data)=>{
        console.log('sdout:\n',data);
    });
    child.stderr.on('data',(data)=>{
        console.log('stder:\n',Buffer.from(data).toString());
    });

    child.on('error',(error)=>{
        console.log('error\n',error);
    });

    child.on('exit',(code,signal)=>{
        if(code) console.log('Process exit with code: ',code);
        else if(signal) console.log('Process killed with signal: ',signal);
        else console.log('Backup has been created successful.');
    });

}
