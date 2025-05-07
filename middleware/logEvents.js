// in terminal    npm i nodemon -g    that get's nodemon, you all nodemon instead of node
// leave with control c
// npm init -y                this makes the json for the packages for project. So you don't need to isntall all thsi for you
// npm i date-fns       no idea, tutorial said this idk
// Then npm i nodemon -D to set it as a dependence

// test instuction: npm start ---- npm run dev

// npm i uuid

// npm i express

// npm i cors

const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    console.log(logItem);
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', "logs"));
        }
        // testing
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (err) {
        console.log(err);
    }
}

const logger = ((req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origion}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
})

module.exports = { logger, logEvents };