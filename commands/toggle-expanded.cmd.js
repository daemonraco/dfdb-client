/**
 * @file toggle-expanded.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const Promise = require('es6-promise');

module.exports = {
    commands: ['toggle-expanded', 'expanded'],
    description: 'Changes the way objects are displayed.',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            manager.toggleExpanded();
            resolve();
        });
    }
}