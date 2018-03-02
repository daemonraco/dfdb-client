/**
 * @file list-indexes.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['schema'],
    description: `loads and displays a collection's schema.`,
    usage: 'schema collection-name',
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
                    let results;
                    if (col.hasSchema()) {
                        results = `Schema:\n`;
                        results += manager.prepareToDisplay(col.schema(), '\t', true);
                    } else {
                        results = chalk.red(`Collection '${collectionName}' has no schema.`);
                    }

                    resolve(results);
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}