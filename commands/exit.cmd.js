/**
 * @file exit.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const Promise = require('es6-promise');

module.exports = {
    commands: ['exit'],
    description: 'Closes this terminal.',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            manager.exit();
        });
    }
}