/**
 * @file ignore.cpt.js
 * @author Alejandro Darío Simi
 */
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    complete: ({ manager, line }) => {
        return [[], line];
    }
}