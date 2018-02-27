'use strict';

const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs');
const path = require('path');
const Promise = require('es6-promise');
const readline = require('readline');

const { CURRENT_DB } = require('./constants');

class Manager {
    //
    // Constructor.
    constructor() {
        this._loaded = false;
        this._load();
    }
    //
    // Public methods.
    completer() {
        const commands = Object.keys(this._cmdTriggers).sort();

        return (line) => {
            let out;

            line = line.split(' ');

            if (line.length < 2) {
                const hits = commands.filter((c) => c.startsWith(line));
                out = [hits.length ? hits : commands, line.join(' ')];
            } else {
                const cmd = this._getCommandName(line[0]);
                if (cmd) {
                    line.shift();
                    out = line.join(' ');

                    const completerName = this._cmds[cmd].completer;
                    if (typeof this._completers[completerName] !== 'undefined') {
                        out = this._completers[completerName].complete({ manager: this, line: out });
                    }
                } else {
                    out = line.join(' ');
                }
            }

            return out;
        };
    }
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
        const close = () => {
            console.log(chalk.cyan(`bye!`));
            process.exit();
        };

        const currentDB = this.get(CURRENT_DB);
        if (currentDB) {
            currentDB.close().then(close, close);
        } else {
            close();
        }
    }
    get(key) {
        return this._data[key];
    }
    prepareToDisplay(what, indent = '') {
        let out = '';

        if (Array.isArray(what)) {
            out = [];
            what.forEach(x => {
                out.push(this.prepareToDisplay(x, `${indent}  `));
            });

            if (out.length > 0) {
                if (this._displayExpanded) {
                    out = `[\n${out.join(',\n')}\n]`;
                } else {
                    out = `[\n\n${out.join(',\n\n')}\n\n]`;
                }
            } else {
                out = `[]`;
            }
        } else {
            if (this._displayExpanded) {
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

        let args = text.split(' ');
        const cmdText = args.shift();
        const cmdName = this._getCommandName(cmdText);
        if (cmdName) {
            out = this._cmds[cmdName].runner({ manager: this, args });
        } else {
            out = new Promise((resolve, reject) => {
                reject(`Unknown command '${cmdText}'`);
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
    toggleExpanded() {
        this._displayExpanded = !this._displayExpanded;
    }
    //
    // Protected methods.
    _getCommandName(givenName) {
        return typeof this._cmdTriggers[givenName] !== 'undefined' ? this._cmdTriggers[givenName] : false;
    }
    _initializeLineReader() {
        this._lineReader = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            //   terminal: true,
            completer: this.completer(),
            prompt: this.promptPrefix()
        });

        this._lineReader.on('close', () => {
            if (this._pendingLines.length > 0) {
                this._finishAfterProcessing = true;
            } else {
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
            fs.readdirSync(cmdsPath)
                .filter(x => x.match(/.+\.cmd\.js$/))
                .map(x => {
                    return {
                        name: x,
                        path: path.join(cmdsPath, x)
                    }
                })
                .forEach(cmd => {
                    this._cmds[cmd.name] = require(cmd.path);
                    this._cmds[cmd.name].commands.forEach(keyword => this._cmdTriggers[keyword] = cmd.name);

                    if (typeof this._cmds[cmd.name].completer !== 'undefined') {
                        const completerName = this._cmds[cmd.name].completer;
                        if (typeof this._completers[completerName] === 'undefined') {
                            delete this._cmds[cmd.name].completer;
                        }
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
