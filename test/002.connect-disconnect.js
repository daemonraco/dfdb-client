'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const suppose = require('suppose');
const CommandParser = require('./assets/command-parser');

const dbDir = path.join(__dirname, 'tmp');
const dbName = '002.test';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb-client: Connect and disconnect databases [002]', function () {
    it('access a database', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose('node', ['cmd.js'], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`connect ${dbName} ${dbDir}\n`)
            .when(/dfdb(.*)> /).respond(`disconnect\n`)
            .when(/.*>/).respond('exit\n')
            .on('error', function (err) {
                assert.isTrue(false, `An error was not expected here. Error${err}`);
                done();
            })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.isNotNull(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`));
                assert.isNotNull(CommandParser.grep(`dfdb[ DB:${dbName} ]>`));
                assert.isNotNull(CommandParser.grep(`Closed`));

                done();
            });
    });

    it(`access a database using 'open'`, done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose('node', ['cmd.js'], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`open ${dbDir}/${dbName}.dfdb\n`)
            .when(/dfdb(.*)> /).respond(`disconnect\n`)
            .when(/.*>/).respond('exit\n')
            .on('error', function (err) {
                assert.isTrue(false, `An error was not expected here. Error${err}`);
                done();
            })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.isNotNull(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`));
                assert.isNotNull(CommandParser.grep(`dfdb[ DB:${dbName} ]>`));
                assert.isNotNull(CommandParser.grep(`Closed`));

                done();
            });
    });
});