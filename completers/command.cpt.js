/**
 * @file command.cpt.js
 * @author Alejandro Darío Simi
 */
'use strict';

module.exports = {
    complete: ({ manager, line }) => {
        let out;
        const commands = manager.triggers();

        line = line.split(' ');

        if (line.length < 2) {
            const hits = commands.filter(c => c.startsWith(line));
            out = [hits, line.join(' ')];
        } else {
            const cmd = manager.getCommandName(line[0]);
            if (cmd) {
                line.shift();
                out = line.join(' ');

                const completerName = manager._cmds[cmd].completer;
                if (typeof manager._completers[completerName] !== 'undefined') {
                    out = manager._completers[completerName].complete({ manager: manager, line: out });
                }
            } else {
                out = line.join(' ');
            }
        }

        return out;
    }
}