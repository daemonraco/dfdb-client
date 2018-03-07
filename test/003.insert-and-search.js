'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const suppose = require('suppose');
const CommandParser = require('./assets/command-parser');

const dbDir = path.join(__dirname, 'tmp');
const dbName = '003.test';
const collectionName = 'my_collection';
const testObject1 = {
    aNumber: 1,
    aFloat: 2.2,
    aString: ' 3 ',
    anArray: [1, 2.2, ' 3 '],
    anObject: {
        aNumber: 1,
        aFloat: 2.2,
        aString: ' 3 '
    }
};
const testObject2 = {
    aNumber: 2,
    aFloat: 3.3,
    aString: ' 4 ',
    anArray: [2, 3.3, ' 4 '],
    anObject: {
        aNumber: 2,
        aFloat: 3.3,
        aString: ' 4 '
    }
};

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb-client: Connect and disconnect databases [002]', function () {
    this.timeout(5000);

    it('counting elements before inserting (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^0$`).length, 1);

                done();
            });
    });

    it('counting elements before inserting (with empty conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^0$`).length, 1);

                done();
            });
    });

    it('searching elements before inserting (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(/^\[\]$/).length, 1);

                done();
            });
    });

    it('searching elements before inserting (with empty conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(/^\[\]$/).length, 1);

                done();
            });
    });

    it('inserting a somehow complex document', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`insert ${collectionName} ${JSON.stringify(testObject1)}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^\{"aNumber":1.+Z"}$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0]); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject1.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject1.aFloat);
                assert.strictEqual(insertResult.aString, testObject1.aString);
                assert.deepEqual(insertResult.anArray, testObject1.anArray);
                assert.deepEqual(insertResult.anObject, testObject1.anObject);
                assert.deepEqual(insertResult._id, '1');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });

    it('counting elements after inserting (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^1$`).length, 1);

                done();
            });
    });

    it('counting elements after inserting (with empty conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^1$`).length, 1);

                done();
            });
    });

    it('counting elements after inserting (with empty conditions and shortcut)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`c ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^1$`).length, 1);

                done();
            });
    });

    it('counting elements after inserting (with the ID as condition)', done => {
        const logFile = CommandParser.getLogPath(this.file);
        const condition = {
            _id: {
                $exact: '1'
            }
        };

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName} ${JSON.stringify(condition)}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.egrep(`^1$`).length, 1);

                done();
            });
    });

    it('searching elements after inserting (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":1.+Z"\})$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject1.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject1.aFloat);
                assert.strictEqual(insertResult.aString, testObject1.aString);
                assert.deepEqual(insertResult.anArray, testObject1.anArray);
                assert.deepEqual(insertResult.anObject, testObject1.anObject);
                assert.deepEqual(insertResult._id, '1');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });

    it('searching elements after inserting (with empty conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":1.+Z"\})$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject1.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject1.aFloat);
                assert.strictEqual(insertResult.aString, testObject1.aString);
                assert.deepEqual(insertResult.anArray, testObject1.anArray);
                assert.deepEqual(insertResult.anObject, testObject1.anObject);
                assert.deepEqual(insertResult._id, '1');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });

    it('searching elements after inserting (with empty conditions and shortcut)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName} {}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":1.+Z"\})$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject1.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject1.aFloat);
                assert.strictEqual(insertResult.aString, testObject1.aString);
                assert.deepEqual(insertResult.anArray, testObject1.anArray);
                assert.deepEqual(insertResult.anObject, testObject1.anObject);
                assert.deepEqual(insertResult._id, '1');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });

    it('searching elements after inserting (with the ID as condition)', done => {
        const logFile = CommandParser.getLogPath(this.file);
        const condition = {
            _id: {
                $exact: '1'
            }
        };

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`s ${collectionName} ${JSON.stringify(condition)}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":1.+Z"\})$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject1.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject1.aFloat);
                assert.strictEqual(insertResult.aString, testObject1.aString);
                assert.deepEqual(insertResult.anArray, testObject1.anArray);
                assert.deepEqual(insertResult.anObject, testObject1.anObject);
                assert.deepEqual(insertResult._id, '1');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });

    it('counting elements after inserting (with wrong conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`count ${collectionName} WRONG VALUE\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.grep(`Unable to parse condition 'WRONG VALUE'`).length, 1);

                done();
            });
    });

    it('searching elements after inserting (with wrong conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName} WRONG VALUE\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);
                assert.strictEqual(CommandParser.grep(`Unable to parse condition 'WRONG VALUE'`).length, 1);

                done();
            });
    });

    it('inserting a somehow complex document (using shortcuts)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`i ${collectionName} ${JSON.stringify(testObject2)}\n`)
            .when(/.*>/).respond('exit\n')
            // .on('error', function (err) {
            //     assert.isTrue(false, `An error was not expected here. Error: ${err}`);
            //     done();
            // })
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const insertResultStrs = CommandParser.egrep(/^\{"aNumber":2.+Z"}$/);
                assert.strictEqual(insertResultStrs.length, 1);

                let insertResult = null;
                try { insertResult = JSON.parse(insertResultStrs[0]); } catch (e) { }
                assert.isNotNull(insertResult);
                assert.strictEqual(insertResult.aNumber, testObject2.aNumber);
                assert.strictEqual(insertResult.aFloat, testObject2.aFloat);
                assert.strictEqual(insertResult.aString, testObject2.aString);
                assert.deepEqual(insertResult.anArray, testObject2.anArray);
                assert.deepEqual(insertResult.anObject, testObject2.anObject);
                assert.deepEqual(insertResult._id, '2');
                assert.property(insertResult, '_created');
                assert.property(insertResult, '_updated');

                done();
            });
    });
});