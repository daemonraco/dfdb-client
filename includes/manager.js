/**
 * @file manager.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs');
const path = require('path');
const Promise = require('es6-promise');
const readline = require('readline');

const {
    CMD_COMMAND,
    CURRENT_DB
} = require('./constants');

class Manager {
    //
    // Constructor.
    constructor() {
        this._loaded = false;
        this._load();
    }
    //
    // Public methods.
    commands() {
        const out = [];

        Object.keys(this._cmds).forEach(name => {
            const { commands, description, fullDescription, usage } = this._cmds[name];
            out.push(JSON.parse(JSON.stringify({ commands, description, fullDescription, usage })));
        });

        return out;
    }
    displayExpanded() {
        return this._displayExpanded;
    }
    exit() {
        //
        // Skipping multiple exit calls.
        if (!this._exiting) {
            this._exiting = true;
            //
            // This is the real final step.
            const close = () => {
                console.log(chalk.cyan(`bye!`));
                process.exit();
            };
            //
            // Closing line reader.
            if (this._lineReader) {
                this._lineReader.close();
            }
            //
            // Is there a connected database?
            const currentDB = this.get(CURRENT_DB);
            if (currentDB) {
                //
                // Closing current database.
                currentDB.close()
                    .then(close)
                    .catch(err => {
                        console.error(chalk.red(`${err}`));
                        close();
                    });
            } else {
                close();
            }
        }
    }
    get(key) {
        return this._data[key];
    }
    getCommandName(givenName) {
        return typeof this._cmdTriggers[givenName] !== 'undefined' ? this._cmdTriggers[givenName] : false;
    }
    prepareToDisplay(what, indent = '', forceExpand = false) {
        let out = '';

        if (Array.isArray(what)) {
            out = [];
            what.forEach(x => {
                out.push(this.prepareToDisplay(x, `${indent}  `));
            });

            if (out.length > 0) {
                if (this._displayExpanded || forceExpand) {
                    out = `[\n${out.join(',\n')}\n]`;
                } else {
                    out = `[\n\n${out.join(',\n\n')}\n\n]`;
                }
            } else {
                out = `[]`;
            }
        } else {
            if (this._displayExpanded || forceExpand) {
                out = chalk.cyan(JSON.stringify(what, null, 2));
            } else {
                out = chalk.cyan(JSON.stringify(what));
            }
        }

        return out.split('\n')
            .map(x => `${indent}${x}`)
            .join('\n');
    }
    promptPrefix() {
        return chalk.green(this._promptPrefix);
    }
    run(text) {
        let out;

        text = text.trim();
        if (text) {
            let args = text.split(' ');
            const cmdText = args.shift();
            const cmdName = this.getCommandName(cmdText);
            if (cmdName) {
                out = this._cmds[cmdName].runner({ manager: this, args });
            } else {
                out = new Promise((resolve, reject) => {
                    reject(`Unknown command '${cmdText}'`);
                });
            }
        } else {
            out = new Promise((resolve, reject) => {
                resolve();
            });
        }

        return out;
    }
    set(key, value) {
        this._data[key] = value;
        return this.get(key);
    }
    setPrompt(text) {
        if (text) {
            this._promptPrefix = `${this._fixedPromptPrefix}[${text}]> `;
        } else {
            this._promptPrefix = `${this._fixedPromptPrefix}> `;
        }
    }
    start() {
        const pack = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString());

        commander
            .version(pack.version, '-v --version')
            .option('-d, --dbname [dbname]', 'Database name.')
            .option('-p, --dbpath [dbpath]', 'Database directory.')
            .parse(process.argv);

        if (commander.dbname) {
            if (commander.dbpath) {
                this._pendingLines.push(`connect ${commander.dbname} ${commander.dbpath}`);
            } else {
                this._pendingLines.push(`connect ${commander.dbname}`);
            }
        }

        this._initializeLineReader();
    }
    triggers() {
        return Object.keys(this._cmdTriggers).sort();
    }
    toggleExpanded() {
        this._displayExpanded = !this._displayExpanded;
    }
    //
    // Protected methods.
    _autoComplete(line) {
        let out = [[], line];

        let pieces = line.split(' ');
        if (pieces.length == 1) {
            out = this._completers[CMD_COMMAND].complete({ manager: this, line });
        } else if (pieces.length > 1) {
            let cmdPiece = pieces.shift();
            let cmdName = this.getCommandName(cmdPiece);

            if (cmdName && typeof this._cmds[cmdName].completer !== 'undefined') {
                const completers = this._cmds[cmdName].completer;
                const completerPosition = pieces.length - 1;
                const currentCompleter = typeof completers[completerPosition] !== undefined ? completers[completerPosition] : false;

                if (currentCompleter) {
                    out = this._completers[currentCompleter.name].complete({
                        manager: this,
                        line: pieces.pop(),
                        params: currentCompleter.params
                    });
                }
            }
        }

        return out;
    }
    _initializeLineReader() {
        this._lineReader = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            historySize: 1000,
            removeHistoryDuplicates: true,
            completer: line => this._autoComplete(line),
            prompt: this.promptPrefix()
        });

        this._lineReader.on('close', () => {
            if (this._pendingLines.length > 0) {
                this._finishAfterProcessing = true;
            } else {
                this._lineReader = null;
                console.log(``);
                this.exit();
            }
        });

        this._lineReader.on('line', line => {
            this._pendingLines.push(line);
            this._processPendingLine();
        });

        this._lineReader.prompt();
        this._processPendingLine();
    }
    _load() {
        if (!this._loaded) {
            this._loaded = true;

            this._processingPendingLines = false;
            this._finishAfterProcessing = false;
            this._pendingLines = [];

            this._fixedPromptPrefix = 'dfdb';
            this._displayExpanded = false;

            this.setPrompt();

            this._data = {};

            this._completers = {};
            const cptsPath = path.join(__dirname, '../completers');
            const cptsPattern = /^(.+)\.cpt\.js$/;
            fs.readdirSync(cptsPath)
                .filter(x => x.match(cptsPattern))
                .map(x => {
                    return {
                        name: x.replace(cptsPattern, '$1'),
                        path: path.join(cptsPath, x)
                    }
                })
                .forEach(cpt => {
                    this._completers[cpt.name] = require(cpt.path);
                });

            this._cmds = {};
            this._cmdTriggers = {};
            const cmdsPath = path.join(__dirname, '../commands');
            const cmdsPattern = /^(.+)\.cmd\.js$/;
            fs.readdirSync(cmdsPath)
                .filter(x => x.match(cmdsPattern))
                .map(x => {
                    return {
                        name: x.replace(cmdsPattern, '$1'),
                        path: path.join(cmdsPath, x)
                    }
                })
                .forEach(cmd => {
                    this._cmds[cmd.name] = require(cmd.path);
                    this._cmds[cmd.name].commands.forEach(keyword => this._cmdTriggers[keyword] = cmd.name);

                    if (typeof this._cmds[cmd.name].completer !== 'undefined') {
                        if (!Array.isArray(this._cmds[cmd.name].completer)) {
                            this._cmds[cmd.name].completer = [this._cmds[cmd.name].completer];
                        }

                        this._cmds[cmd.name].completer = this._cmds[cmd.name].completer.map(completer => {
                            let out = {};

                            if (typeof completer === 'object') {
                                out = completer;
                            } else {
                                out.name = completer;
                                out.params = {};
                            }

                            return out;
                        });
                        this._cmds[cmd.name].completer.forEach(completer => {
                            if (typeof this._completers[completer.name] === 'undefined') {
                                console.error(chalk.red(`Unknown completer '${completer.name}' used in '${cmd.name}'.`));
                                delete this._cmds[cmd.name].completer;
                            }
                        });
                    }
                });
        }
    }
    _nextQuestion() {
        this._lineReader.setPrompt(this.promptPrefix());
        this._lineReader.prompt();
    }
    _processPendingLine() {
        if (this._pendingLines.length > 0 && !this._processingPendingLines) {
            this._processingPendingLines = true;
            const line = this._pendingLines.shift();

            const done = () => {
                this._processingPendingLines = false;
                this._processPendingLine();
            };

            this.run(line).then(msg => {
                if (msg) {
                    console.log(msg);
                }
                done();
            }).catch(err => {
                console.error(chalk.red(err));
                done();
            });
        } else {
            if (this._finishAfterProcessing) {
                this.exit();
            } else {
                this._nextQuestion();
            }
        }
    }
}

const instance = new Manager();

module.exports = instance;
