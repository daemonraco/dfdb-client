'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['closedb'],
    description: 'Closes current database connection.',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);

            if (conn) {
                conn.close().then(() => {
                    manager.set(CURRENT_DB, null);
                    manager.setPrompt();
                    resolve(chalk.green(`Closed`));
                }).catch(err => reject(`${err}`));
            } else {
                reject(`Not connected to any database`);
            }
        });
    }
}