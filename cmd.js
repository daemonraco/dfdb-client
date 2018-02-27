'use strict';

const Manager = require('./includes/manager');

Manager.start();

process.stdin.resume();
const handleInterruption = (signal) => {
    Manager.exit();
}
process.on('SIGINT', handleInterruption);
process.on('SIGTERM', handleInterruption);
