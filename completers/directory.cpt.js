/**
 * @file directory.cpt.js
 * @author Alejandro Darío Simi
 */
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    complete: ({ manager, line }) => {
        let out = [[], line];

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
                    .filter(x => fs.statSync(x).isDirectory());
            } catch (e) { }

            out = [options.filter(c => c.startsWith(line)), line];
        }

        return out;
    }
}