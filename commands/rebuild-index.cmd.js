'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['rebuild-index', 'rebuild'],
    description: 'Rebuilds an index on certain collection.',
    usage: 'rebuild-index collection-name field-name',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            const fieldName = args.shift();
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!fieldName) {
                error = `No field name given.`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }

            if (!error) {
                conn.collection(collectionName)
                    .then(col => {
                        col.rebuildFieldIndex(fieldName).then(() => {
                            resolve(chalk.green(`Field index rebuilt`));
                        }).catch(err => reject(`${err}`));
                    })
                    .catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}