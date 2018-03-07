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
    this.timeout(5000);

    it('request a help text', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), [], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond('help\n')
            .when(/dfdb(.*)> /).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.egrep(`'add-index'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'collections'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'connect'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'delete'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'disconnect'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'drop-collection'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'drop-index'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'exit'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'find'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'help'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'initializer'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'insert'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'indexes'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'open'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'rebuild-index'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'remove-schema'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'schema'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'search'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'set-initializer'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'set-schema'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'toggle-expanded'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'truncate'`).length, 1);
                assert.strictEqual(CommandParser.egrep(`'update'`).length, 1);

                done();
            });
    });
});