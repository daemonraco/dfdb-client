/**
 * @file search.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['search', 's'],
    description: 'Searches for some conditions on a collection.',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            let conditions = args.join(' ').trim();
            let conditionsJSON;
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }

            conditions = conditions ? conditions : '{}';
            try {
                conditionsJSON = JSON.parse(conditions);
            } catch (e) {
                conditionsJSON = {};
                error = `Unable to parse condition '${conditions}'.`;
            }

            if (!error) {
                conn.collection(collectionName)
                    .then(col => {
                        col.search(conditionsJSON).then(docs => {
                            if (col.error()) {
                                reject(col.lastError());
                            } else {
                                resolve(manager.prepareToDisplay(docs));
                            }
                        }).catch(err => reject(`${err}`));
                    })
                    .catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}