'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { sprintf } = require('sprintf-js');
const stripAnsi = require('strip-ansi');

class CommandParser {
    //
    // Constructor
    constructor() {
        this._loaded = false;
        this._load();
    }
    //
    // Public methods.
    displayLog(marked = false) {
        let out = this._currentLog
            .split('\n')
            .map(l => `\t| ${marked ? chalk.yellow('>>>') : ''}${l}${marked ? chalk.yellow('<<<') : ''}`)
            .join('\n');

        console.log(chalk.cyan(out));
    }
    egrep(patternString, debug = false) {
        const pattern = typeof patternString === 'string' ? new RegExp(`${patternString}`) : patternString;

        if (debug) {
            const debugResults = this._currentLog
                .split('\n')
                .map(l => {
                    const match = l.match(pattern);
                    const toReturn = match !== null ? l : null;
                    console.log(`Line ${chalk.cyan(l)}: ${chalk.yellow(JSON.stringify(toReturn))}`);
                    return toReturn;
                })
                .filter(l => l != null);
            console.log(`egrep result: ${chalk.cyan(debugResults)}`);
        }

        return this._currentLog
            .split('\n')
            .map(l => l.match(pattern) !== null ? l : null)
            .filter(l => l != null);
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
        this._currentLog = stripAnsi(fs.readFileSync(logPath).toString().replace(/\r/g, ''));
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
