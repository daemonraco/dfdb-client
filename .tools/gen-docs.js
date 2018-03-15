'use strict';

const fs = require('fs');
const path = require('path');
const suppose = require('suppose');
const { tmpdir } = require('os');

const resultsPath = path.join(tmpdir(), `${Math.random().toString(36).replace(/[^a-z]+/g, '')}.out`);
const readmePath = path.join(__dirname, `../README.md`);

const inject = (section, data, next) => {
    const openPattern = new RegExp(`<!-- AUTO:${section}.* -->`);
    const closePattern = new RegExp(`<!-- /AUTO -->`);

    const readmeLines = fs.readFileSync(readmePath)
        .toString()
        .split('\n');
    let newReadmeContents = '';
    let ignoring = false;
    readmeLines.forEach(line => {
        if (ignoring) {
            if (line.match(closePattern)) {
                ignoring = false;

                newReadmeContents += `${line}\n`;
            }
        } else {
            newReadmeContents += `${line}\n`;
            if (line.match(openPattern)) {
                ignoring = true;

                newReadmeContents += '```\n';
                newReadmeContents += `${data}\n`;
                newReadmeContents += '```\n';
            }
        }
    });

    fs.writeFileSync(readmePath, newReadmeContents);
    next();
};

const steps = [];
steps.push(next => {
    suppose('node', [path.join(__dirname, '../cmd.js'), '--help'], {
        debug: fs.createWriteStream(resultsPath)
    }).end(code => {
        let lines = fs.readFileSync(resultsPath)
            .toString()
            .replace(/(Usage: )([^ ]+)( \[options\])/, '$1dfdb-client$3')
            .split('\n')
            .filter(x => x);

        const separator = /^[-]+$/;
        let ignore = true;
        lines = lines.filter(x => {
            if (ignore) {
                if (x.match(separator)) {
                    ignore = false;
                }
                return false;
            } else {
                return true;
            }
        });

        inject('options', lines.join('\n'), next);
    });
});
steps.push(next => {
    suppose('node', [path.join(__dirname, '../cmd.js')], { debug: fs.createWriteStream(resultsPath) })
        .when(/dfdb(.*)> /).respond('help\n')
        .when(/dfdb(.*)> /).respond('exit\n')
        .end(code => {
            let lines = fs.readFileSync(resultsPath)
                .toString()
                .split('\n');

            const startPattern = /^These the available options:/;
            const continuePattern = /^    /;
            let ignore = true;
            lines = lines.filter(x => {
                if (ignore) {
                    if (x.match(startPattern)) {
                        ignore = false;
                    }
                } else {
                    if (x && !x.match(continuePattern)) {
                        ignore = true;
                    }
                }

                return !ignore;
            });

            inject('commands', lines.join('\n'), next);
        });
});
steps.push(next => {
    fs.unlink(resultsPath);
    next();
});
steps.push(next => {
    const readmeLines = fs.readFileSync(readmePath)
        .toString()
        .split('\n');

    while (readmeLines[readmeLines.length - 1] === '') {
        readmeLines.pop();
    }
    readmeLines.push('');

    fs.writeFileSync(readmePath, readmeLines.join('\n'));
    next();
});

const run = () => {
    const step = steps.shift();
    if (step) {
        step(run);
    } else {
        process.exit();
    }
}
run();
