'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['indexes'],
    description: 'Lists all indexes of certain collection.',
    usage: 'indexes collection-name',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }

            if (!error) {
                conn.collection(collectionName).then(col => {
                    let message = '';
                    const indexes = col.indexes();

                    Object.keys(indexes).forEach(key => {
                        message += `'${chalk.green(indexes[key].name)}':\n`;
                        message += `    Field: '${chalk.yellow(indexes[key].field)}'\n`;
                    });

                    resolve(message);
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}