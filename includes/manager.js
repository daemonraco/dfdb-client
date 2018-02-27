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

            if (line.split(' ').length < 2) {
                const hits = commands.filter((c) => c.startsWith(line));
                out = [hits.length ? hits : commands, line];
            } else {
                out = line;
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
        if (cmdText && typeof this._cmdTriggers[cmdText] !== 'undefined') {
            const name = this._cmdTriggers[cmdText];
            out = this._cmds[name].runner({ manager: this, args });
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
            this._cmds = {};
            this._cmdTriggers = {};
            this._data = {};

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
