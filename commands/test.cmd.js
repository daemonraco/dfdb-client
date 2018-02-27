'use strict';

const Promise = require('es6-promise');

module.exports = {
    commands: ['TEST'],
    description: 'TEST',
    runner: ({ manager, args }) => {
        return new Promise((resolve, reject) => {
            manager.setPrompt(args.join(' ').trim());
            resolve();
        });
    }
}