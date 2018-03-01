/**
 * @file connect.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['connect'],
    description: 'Opens a database connection and sets it as current.',
    usage: 'connect db-name [db-path]',
    completer: ['ignore', 'directory'],
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            args[1] = typeof args[1] === 'undefined' ? '.' : args[1];

            DocsOnFileDB.connect(args[0], args[1])
                .then(conn => {
                    manager.set(CURRENT_DB, conn);
                    manager.setPrompt(`DB:${args[0]}`);
                    resolve(chalk.green(`Connected`));
                })
                .catch(err => reject(`${err}`));
        });
    }
}