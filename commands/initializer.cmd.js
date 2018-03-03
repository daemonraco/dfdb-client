/**
 * @file initializer.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['initializer', 'init'],
    description: 'Displays current connection initialization specifications.',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            let error = false;

            if (!conn) {
                error = `Not connected to any database`;
            }

            if (!error) {
                if (conn.hasInitializer()) {
                    let message = `Initializer:\n`;
                    message += chalk.cyan(manager.prepareToDisplay(conn.initializer(), '\t', true));

                    resolve(message);
                } else {
                    reject(`Current connection has no initializer`);
                }
            } else {
                reject(error);
            }
        });
    }
}