/**
 * @file help.cmd.js
 * @author Alejandro Darío Simi
 */
'use strict';

const chalk = require('chalk');
const Promise = require('es6-promise');

module.exports = {
    commands: ['help', '?'],
    description: 'Displays this help information.',
    completer: 'command',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            const cmdName = typeof args[0] === 'undefined' ? false : args[0];

            let message = `These the available options`;
            if (cmdName) {
                message += ` (filtered for: '${cmdName}')`;
            }
            message += `:\n`;

            let commandMessages = [];
            const indent = '    ';
            manager.commands()
                .filter(c => !cmdName || c.commands.indexOf(cmdName) > -1)
                .forEach(c => {
                    let mainCommand = chalk.yellow(c.commands.shift());
                    let alias = c.commands.map(x => chalk.cyan(x)).join(`', '`);
                    alias = alias ? `'${alias}'` : false;

                    let message = `${indent.repeat(1)}'${mainCommand}'\n`;

                    if (cmdName && c.fullDescription) {
                        message += `${indent.repeat(2)}${c.fullDescription}`;
                    } else {
                        message += `${indent.repeat(2)}${c.description}`;
                    }

                    if (alias) {
                        message += `\n${indent.repeat(3)}Aliases: ${alias}`;
                    }

                    if (c.usage) {
                        message += `\n${indent.repeat(3)}Usage: ${chalk.cyan(c.usage)}`;
                    }

                    commandMessages.push(message);
                });
            message += commandMessages.join('\n\n');

            resolve(message);
        });
    }
}