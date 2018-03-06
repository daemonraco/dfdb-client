'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { sprintf } = require('sprintf-js');

class CommandParser {
    //
    // Constructor
    constructor() {
        this._loaded = false;
        this._load();
    }
    //
    // Public methods.
    displayLog() {
        let out = this._currentLog
            .split('\n')
            .map(l => `\t| ${l}`)
            .join('\n');

        console.log(chalk.cyan(out));
    }
    egrep(patternString) {
        return this._currentLog.match(RegExp(`${patternString}`));
    }
    getLogPath(scriptPath) {
        const index = ++this._logIndex;

        let scriptPathPieces = path.parse(scriptPath);
        scriptPathPieces.dir = path.join(__dirname, '../tmp');
        scriptPathPieces.ext = '.log';
        scriptPathPieces.name = sprintf('[%03d]%s', index, scriptPathPieces.name);
        scriptPathPieces.base = `${scriptPathPieces.name}${scriptPathPieces.ext}`;

        return path.format(scriptPathPieces);
    }
    grep(patternString) {
        return this.egrep(patternString
            .replace('(', '\\(')
            .replace(')', '\\)')
            .replace('[', '\\[')
            .replace(']', '\\]')
            .replace('.', '\\.'));
    }
    loadLog(logPath) {
        this._currentLog = fs.readFileSync(logPath).toString();
    }
    //
    // Protected methods.
    _load() {
        if (!this._loaded) {
            this._loaded = true;

            this._currentLog = false;
            this._logIndex = 0;
        }
    }
}

const instance = new CommandParser();

module.exports = instance;
