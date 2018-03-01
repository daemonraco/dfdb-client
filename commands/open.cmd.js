/**
 * @file open.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const connect = require('./includes/connect');
const path = require('path');

module.exports = {
    commands: ['open'],
    description: `Opens a database connection and sets it as current based on its full path.`,
    usage: 'open full-db-path',
    completer: [{
        name: 'file',
        params: {
            pattern: /^.*\.dfdb$/
        }
    }],
    runner: ({ manager, args }) => {
        const fullPath = path.parse(args[0]);
        fullPath.dir = fullPath.dir ? fullPath.dir : '.';
        return connect(manager, fullPath.name, fullPath.dir);
    }
}