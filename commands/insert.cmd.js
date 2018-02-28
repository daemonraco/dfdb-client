'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['insert', 'i'],
    description: 'Inserts a new document to certain collection.',
    usage: 'insert collection-name document',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            const doc = args.join(' ');
            let conditionsJSON;
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }
            try {
                conditionsJSON = JSON.parse(doc);
            } catch (e) {
                conditionsJSON = {};
                error = `Unable to parse document '${doc}'.`;
            }

            if (!error) {
                conn.collection(collectionName)
                    .then(col => {
                        col.insert(conditionsJSON).then(insertedDoc => {
                            resolve(manager.prepareToDisplay(insertedDoc));
                        }).catch(err => reject(`${err}`));
                    })
                    .catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}