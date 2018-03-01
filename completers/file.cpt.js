/**
 * @file file.cpt.js
 * @author Alejandro Darío Simi
 */
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    complete: ({ manager, line, params }) => {
        let out = [[], line];

        if (typeof params.pattern === 'undefined' || !(params.pattern instanceof RegExp)) {
            params.pattern = /^.*$/i;
        }

        let currentPath = path.join(line ? line : '.');
        let currentStat = null;
        try { currentStat = fs.statSync(currentPath); } catch (e) { };
        if (!currentStat || !currentStat.isDirectory()) {
            currentPath = path.dirname(currentPath);
        }

        try { currentStat = fs.statSync(currentPath); } catch (e) { };
        if (currentStat) {
            let options = [];
            try {
                options = fs.readdirSync(currentPath)
                    .map(x => path.join(currentPath, x))
                    .filter(x => {
                        let accepted = false;
                        const stat = fs.statSync(x);
                        if (stat.isDirectory()) {
                            accepted = true;
                        } else if (stat.isFile() && path.basename(x).match(params.pattern)) {
                            accepted = true;
                        }
                        return accepted;
                    });
            } catch (e) { }

            out = [options.filter(c => c.startsWith(line)), line];
        }

        return out;
    }
}