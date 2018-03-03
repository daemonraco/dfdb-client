/**
 * @file exit.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['remove-schema'],
    description: 'Removes the schema specification from a collection.',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            let error = false;

            if (!error && !conn) {
                error = `Not connected to any database`;
            }
            if (!error && !collectionName) {
                error = `No collection given`;
            }

            if (!error) {
                conn.collection(collectionName).then(collection => {
                    collection.removeSchema().then(() => {
                        resolve(chalk.green.bold(`Schema has been removed.`))
                    }).catch(err => reject(`${err}`));
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}