'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['drop-collection'],
    description: 'Deletes certain collection and all its assets.',
    usage: 'drop-collection collection-name',
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
                    col.drop()
                        .then(() => {
                            resolve('Collection deleted.');
                        }).catch(err => reject(`${err}`));
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}