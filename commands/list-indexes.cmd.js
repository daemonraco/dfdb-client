'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['indexes'],
    description: 'Lists all indexes of certain collection.',
    usage: 'indexes collection-name',
    completer: 'collection',
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
                    let message = 'Indexes:';
                    const indexes = col.indexes();

                    Object.keys(indexes).forEach(key => {
                        message += `\n    - '${chalk.green(indexes[key].name)}' (field: '${chalk.yellow(indexes[key].field)}')`;
                    });

                    resolve(message);
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}