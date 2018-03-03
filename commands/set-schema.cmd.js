/**
 * @file set-schema.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const fs = require('fs');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['set-schema'],
    description: 'Sets a new schema specification to a collection based on a JSON file.',
    completer: [
        'collection',
        {
            name: 'file',
            params: {
                pattern: /^.*\.json$/
            }
        }
    ],
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            const schemaPath = args.shift();
            let error = false;

            if (!error && !conn) {
                error = `Not connected to any database`;
            }
            if (!error && !collectionName) {
                error = `No collection given`;
            }
            if (!error && !schemaPath) {
                error = `No schema specification path given`;
            }

            if (!error) {
                let stat = null;
                let excep = null;
                try { stat = fs.statSync(schemaPath); } catch (e) { excep = e; }
                if (!stat) {
                    error = `Given schema specification path is invalid. ${excep}`;
                }
            }

            let jsonData = null;
            if (!error) {
                try {
                    jsonData = JSON.parse(fs.readFileSync(schemaPath).toString());
                } catch (e) {
                    error = `Given schema specification is invalid. ${e}`;
                }
            }

            if (!error) {
                conn.collection(collectionName).then(collection => {
                    collection.setSchema(jsonData)
                        .then(() => {
                            resolve(chalk.green.bold(`Schema has been set.`))
                        }).catch(err => reject(`${err}`));
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}