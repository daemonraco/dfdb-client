'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['delete', 'd'],
    description: 'Deletes a document from certain collection.',
    usage: 'delete collection-name id',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            const docId = args.shift();
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!docId) {
                error = `Not document ID given`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }

            if (!error) {
                conn.collection(collectionName)
                    .then(col => {
                        col.remove(docId).then(x => {
                            resolve(chalk.green(`Document removed`));
                        }).catch(err => reject(`${err}`));
                    })
                    .catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}