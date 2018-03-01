/**
 * @file connect.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../../includes/constants');

module.exports = (manager, dbname, dbpath) => {
    return new Promise((resolve, reject) => {
        dbpath = typeof dbpath === 'undefined' ? '.' : dbpath;

        const newConnect = () => {
            DocsOnFileDB.connect(dbname, dbpath)
                .then(conn => {
                    manager.set(CURRENT_DB, conn);
                    manager.setPrompt(`DB:${dbname}`);
                    resolve(chalk.green(`Connected`));
                })
                .catch(err => reject(`${err}`));
        };

        const currentConn = manager.get(CURRENT_DB);
        if (currentConn) {
            currentConn.close()
                .then(() => {
                    manager.set(CURRENT_DB, null);
                    newConnect();
                })
                .catch(err => reject(`${err}`));
        } else {
            newConnect();
        }
    });
}