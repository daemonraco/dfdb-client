'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const suppose = require('suppose');
const CommandParser = require('./assets/command-parser');

const dbDir = path.join(__dirname, 'tmp');
const dbName = '004.test';
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
const testObject3 = {
    aNumber: 3,
    aFloat: 4.4,
    aString: ' 5 ',
    anArray: [3, 4.4, ' 5 '],
    anObject: {
        aNumber: 3,
        aFloat: 4.4,
        aString: ' 5 '
    }
};

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb-client: Connect and disconnect databases [004]', function () {
    this.timeout(5000);

    it('inserting a somehow complex document', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`insert ${collectionName} ${JSON.stringify(testObject1)}\n`)
            .when(/.*>/).respond('exit\n')
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

    it('searching elements after inserting (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
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

    it('updating previously inserted document', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`update ${collectionName} 1 ${JSON.stringify(testObject2)}\n`)
            .when(/.*>/).respond('exit\n')
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const updateResultStrs = CommandParser.egrep(/^\{"aNumber":2.+Z"}$/);
                assert.strictEqual(updateResultStrs.length, 1);

                let updateResult = null;
                try { updateResult = JSON.parse(updateResultStrs[0]); } catch (e) { }
                assert.isNotNull(updateResult);
                assert.strictEqual(updateResult.aNumber, testObject2.aNumber);
                assert.strictEqual(updateResult.aFloat, testObject2.aFloat);
                assert.strictEqual(updateResult.aString, testObject2.aString);
                assert.deepEqual(updateResult.anArray, testObject2.anArray);
                assert.deepEqual(updateResult.anObject, testObject2.anObject);
                assert.deepEqual(updateResult._id, '1');
                assert.property(updateResult, '_created');
                assert.property(updateResult, '_updated');

                done();
            });
    });

    it('searching elements after updating (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const updateResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":2.+Z"\})$/);
                assert.strictEqual(updateResultStrs.length, 1);

                let updateResult = null;
                try { updateResult = JSON.parse(updateResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(updateResult);
                assert.strictEqual(updateResult.aNumber, testObject2.aNumber);
                assert.strictEqual(updateResult.aFloat, testObject2.aFloat);
                assert.strictEqual(updateResult.aString, testObject2.aString);
                assert.deepEqual(updateResult.anArray, testObject2.anArray);
                assert.deepEqual(updateResult.anObject, testObject2.anObject);
                assert.deepEqual(updateResult._id, '1');
                assert.property(updateResult, '_created');
                assert.property(updateResult, '_updated');

                done();
            });
    });

    it('updating previously update document (using shortcuts)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`u ${collectionName} 1 ${JSON.stringify(testObject3)}\n`)
            .when(/.*>/).respond('exit\n')
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const updateResultStrs = CommandParser.egrep(/^\{"aNumber":3.+Z"}$/);
                assert.strictEqual(updateResultStrs.length, 1);

                let updateResult = null;
                try { updateResult = JSON.parse(updateResultStrs[0]); } catch (e) { }
                assert.isNotNull(updateResult);
                assert.strictEqual(updateResult.aNumber, testObject3.aNumber);
                assert.strictEqual(updateResult.aFloat, testObject3.aFloat);
                assert.strictEqual(updateResult.aString, testObject3.aString);
                assert.deepEqual(updateResult.anArray, testObject3.anArray);
                assert.deepEqual(updateResult.anObject, testObject3.anObject);
                assert.deepEqual(updateResult._id, '1');
                assert.property(updateResult, '_created');
                assert.property(updateResult, '_updated');

                done();
            });
    });

    it('searching elements after updating (without conditions)', done => {
        const logFile = CommandParser.getLogPath(this.file);

        suppose(path.join(__dirname, 'assets/runner.sh'), ['-d', dbName, '-p', dbDir], { debug: fs.createWriteStream(logFile) })
            .when(/dfdb(.*)> /).respond(`search ${collectionName}\n`)
            .when(/.*>/).respond('exit\n')
            .end(code => {
                CommandParser.loadLog(logFile);

                assert.strictEqual(CommandParser.grep(`Connected to '${dbName}' (directory: '${dbDir}')`).length, 1);
                assert.strictEqual(CommandParser.grep(`dfdb[ DB:${dbName} ]>`).length, 2);

                const updateResultStrs = CommandParser.egrep(/^([ \t]+)(\{"aNumber":3.+Z"\})$/);
                assert.strictEqual(updateResultStrs.length, 1);

                let updateResult = null;
                try { updateResult = JSON.parse(updateResultStrs[0].trim()); } catch (e) { }
                assert.isNotNull(updateResult);
                assert.strictEqual(updateResult.aNumber, testObject3.aNumber);
                assert.strictEqual(updateResult.aFloat, testObject3.aFloat);
                assert.strictEqual(updateResult.aString, testObject3.aString);
                assert.deepEqual(updateResult.anArray, testObject3.anArray);
                assert.deepEqual(updateResult.anObject, testObject3.anObject);
                assert.deepEqual(updateResult._id, '1');
                assert.property(updateResult, '_created');
                assert.property(updateResult, '_updated');

                done();
            });
    });
});