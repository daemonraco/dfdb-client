'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const suppose = require('suppose');
const CommandParser = require('./assets/command-parser');

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb-client: Basic usage [001]', function () {
    it('request a help text', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose('node', ['cmd.js'], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond('help\n')
            .when(/dfdb(.*)> /).respond('exit\n')
            .on('error', function (err) {
                assert.isTrue(false, `An error was not expected here. Error${err}`);
                done();
            })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.isNotNull(CommandParser.egrep(`'add-index'`));
                assert.isNotNull(CommandParser.egrep(`'collections'`));
                assert.isNotNull(CommandParser.egrep(`'connect'`));
                assert.isNotNull(CommandParser.egrep(`'delete'`));
                assert.isNotNull(CommandParser.egrep(`'disconnect'`));
                assert.isNotNull(CommandParser.egrep(`'drop-collection'`));
                assert.isNotNull(CommandParser.egrep(`'drop-index'`));
                assert.isNotNull(CommandParser.egrep(`'exit'`));
                assert.isNotNull(CommandParser.egrep(`'find'`));
                assert.isNotNull(CommandParser.egrep(`'help'`));
                assert.isNotNull(CommandParser.egrep(`'initializer'`));
                assert.isNotNull(CommandParser.egrep(`'insert'`));
                assert.isNotNull(CommandParser.egrep(`'indexes'`));
                assert.isNotNull(CommandParser.egrep(`'open'`));
                assert.isNotNull(CommandParser.egrep(`'rebuild-index'`));
                assert.isNotNull(CommandParser.egrep(`'remove-schema'`));
                assert.isNotNull(CommandParser.egrep(`'schema'`));
                assert.isNotNull(CommandParser.egrep(`'search'`));
                assert.isNotNull(CommandParser.egrep(`'set-initializer'`));
                assert.isNotNull(CommandParser.egrep(`'set-schema'`));
                assert.isNotNull(CommandParser.egrep(`'toggle-expanded'`));
                assert.isNotNull(CommandParser.egrep(`'truncate'`));
                assert.isNotNull(CommandParser.egrep(`'update'`));

                done();
            });
    });
});