'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['collections', 'cols'],
    description: 'Lists all collections of current connection.',
    usage: 'indexes collection-name',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            let error = false;

            if (!conn) {
                error = `Not connected to any database`;
            }

            if (!error) {
                const collections = conn.collections();
                let message = '';

                Object.keys(collections).forEach(key => {
                    message += `'${chalk.green(collections[key].name)}':\n`;
                    message += `    Type: '${chalk.yellow(collections[key].type)}'\n`;
                });

                resolve(message);
            } else {
                reject(error);
            }
        });
    }
}