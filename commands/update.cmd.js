'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['update', 'u'],
    description: 'Updates a document once certain collection.',
    usage: 'update collection-name id document',
    completer: 'collection',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const collectionName = args.shift();
            const docId = args.shift();
            const docString = args.join(' ');
            let doc;
            let error = false;

            if (!collectionName) {
                error = `No collection name given.`;
            }
            if (!docId) {
                error = `No document ID given.`;
            }
            if (!conn) {
                error = `Not connected to any database`;
            }
            try {
                doc = JSON.parse(docString);
            } catch (e) {
                doc = {};
                error = `Unable to parse document '${docString}'.`;
            }

            if (!error) {
                conn.collection(collectionName)
                    .then(col => {
                        col.update(docId, doc).then(updatedDoc => {
                            resolve(manager.prepareToDisplay(updatedDoc));
                        }).catch(err => reject(`${err}`));
                    })
                    .catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}