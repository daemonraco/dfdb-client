/**
 * @file set-initializer.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const fs = require('fs');
const Promise = require('es6-promise');

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    commands: ['set-initializer', 'set-init'],
    description: 'Sets a new initializer specification to current connected database based on a JSON file.',
    completer: [{
        name: 'file',
        params: {
            pattern: /^.*\.json$/
        }
    }],
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const conn = manager.get(CURRENT_DB);
            const initPath = args.shift();
            let error = false;

            if (!error && !conn) {
                error = `Not connected to any database`;
            }
            if (!error && !initPath) {
                error = `No specification path given`;
            }

            if (!error) {
                let stat = null;
                let excep = null;
                try { stat = fs.statSync(initPath); } catch (e) { excep = e; }
                if (!stat) {
                    error = `Given specification path is invalid. ${excep}`;
                }
            }

            let jsonData = null;
            if (!error) {
                try {
                    jsonData = JSON.parse(fs.readFileSync(initPath).toString());
                } catch (e) {
                    error = `Given specification is invalid. ${e}`;
                }
            }

            if (!error) {
                conn.setInitializerFromJSON(jsonData).then(() => {
                    resolve(chalk.green.bold(`Initialization has been set.`))
                }).catch(err => reject(`${err}`));
            } else {
                reject(error);
            }
        });
    }
}