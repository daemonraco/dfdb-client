/**
 * @file connect.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const connect = require('./includes/connect');

module.exports = {
    commands: ['connect'],
    description: 'Opens a database connection and sets it as current.',
    usage: 'connect db-name [db-path]',
    completer: ['ignore', 'directory'],
    runner: ({ manager, args }) => {
        args[1] = typeof args[1] === 'undefined' ? '.' : args[1];
        return connect(manager, args[0], args[1]);
    }
}