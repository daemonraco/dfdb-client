'use strict';

const chalk = require('chalk');
const { DocsOnFileDB } = require('dfdb');
const fs = require('fs');
const readline = require('readline');

const Manager = require('./includes/manager');

let processingPendingLines = false;
let finishAfterProcessing = false;
const pendingLines = [];
let rl;

const initialize = () => {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        //   terminal: true,
        completer: Manager.completer(),
        prompt: Manager.promptPrefix()
    });
    rl.on('close', () => {
        if (pendingLines.length > 0) {
            finishAfterProcessing = true;
        } else {
            console.log(``);
            Manager.exit();
        }
    });
    rl.on('line', line => {
        pendingLines.push(line);
        processPendingLine();
    });

    rl.prompt();
};
const nextQuestion = () => {
    rl.setPrompt(Manager.promptPrefix());
    rl.prompt();
};
const processPendingLine = () => {
    if (pendingLines.length > 0 && !processingPendingLines) {
        processingPendingLines = true;
        const line = pendingLines.shift();

        const done = () => {
            processingPendingLines = false;
            processPendingLine();
        };

        Manager.run(line).then(msg => {
            if (msg) {
                console.log(msg);
            }
            done();
        }).catch(err => {
            console.error(chalk.red(err));
            done();
        });
    } else {
        if (finishAfterProcessing) {
            Manager.exit();
        } else {
            nextQuestion();
        }
    }
};

initialize();

process.stdin.resume();
const handleInterruption = (signal) => {
    Manager.exit();
}
process.on('SIGINT', handleInterruption);
process.on('SIGTERM', handleInterruption);
