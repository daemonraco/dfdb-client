'use strict';

const { CURRENT_DB } = require('../includes/constants');

module.exports = {
    complete: ({ manager, line }) => {
        let out;

        const conn = manager.get(CURRENT_DB);
        if (conn) {
            line = line.split(' ');

            const collections = conn.collections();
            const options = [];
            Object.keys(collections).forEach(key => options.push(collections[key].name));
            const hits = options.filter((c) => c.startsWith(line));

            out = [hits.length ? hits : options, line.join(' ')];
        } else {
            out = line;
        }

        return out;
    }
}