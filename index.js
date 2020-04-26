"use strict";

import performValidation from './utils.js';
import Getopt from 'node-getopt';

function main(argv)
{
    const getopt = new Getopt([
        ['d', 'database=ARG', 'database path', './database.json'],
        ['c', 'clear-cache', 'delete the .files directory'],
        ['f', 'force-download', 'do not check timestamp'],
        ['h' , 'help']
    ]).bindHelp();

    const opt           = getopt.parse(argv);
    const locality      = opt.argv[0]; // "CA/BC/Metro Vancouver Regional District/New Westminster"
    const type          = opt.argv[1]; // "Public Art"
    const fromFormat    = opt.argv[2]; // json
    const toFormat      = opt.argv[3]; // json
    const language      = opt.argv[4]; // ES6
    const databaseFile  = opt.options.database;
    const forceDownload = opt.options.hasOwnProperty("f");
    const clearCache    = opt.options.hasOwnProperty("c");

    performValidation(locality, type, fromFormat, toFormat, language, databaseFile, forceDownload, clearCache)
    .then((data) =>
    {
        console.log(`${data.messages.length} messages`);

        data.messages.forEach((message) =>
        {
            console.log(message);
        });
    })
    .catch((error) =>
    {
        console.log(error);
    });
}

const args = process.argv.slice(2);

main(args);

