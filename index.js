"use strict";

import performValidation from './utils.js';
import Getopt from 'node-getopt';

function main(argv)
{
    const getopt = new Getopt([
        [ 'c', 'clear-cache',         'delete the .files directory'],
        [ 'f', 'force-download=ARG+', 'do not check timestamp for files [all,data,filters,schemas,validators]'],
        [ 'p', 'print',               'print the result'],
        [ '', 'help']
    ]).bindHelp();

    const opt           = getopt.parse(argv);
    const locality      = opt.argv[0]; // "CA/BC/Metro Vancouver Regional District/New Westminster"
    const type          = opt.argv[1]; // "Public Art"
    const fromFormat    = opt.argv[2]; // json
    const toFormat      = opt.argv[3]; // json
    const language      = opt.argv[4]; // ES6
    let databaseFile    = null;

    if(opt.argv.length > 5)
    {
        databaseFile = opt.argv[5]; // database.json
    }
    else
    {
        databaseFile = "./database.json";
    }

    const options = { };

    if(opt.options.hasOwnProperty("clear-cache"))
    {
        options["clearCache"] = true;
    }

    if(opt.options.hasOwnProperty("force-download"))
    {
        const downloads = opt.options["force-download"];

        if(downloads.indexOf("all") > -1 ||
            downloads.indexOf("data") > -1)
        {
            options["clearData"] = true;
        }

        if(downloads.indexOf("all") > -1 ||
            downloads.indexOf("filters") > -1)
        {
            options["clearFilters"] = true;
        }

        if(downloads.indexOf("all") > -1 ||
            downloads.indexOf("schemas") > -1)
        {
            options["clearSchemas"] = true;
        }

        if(downloads.indexOf("all") > -1 ||
            downloads.indexOf("validators") > -1)
        {
            options["clearValidators"] = true;
        }
    }

    performValidation(locality, type, fromFormat, toFormat, language, databaseFile, options)
    .then((data) =>
    {
        if(opt.options.hasOwnProperty("print"))
        {
            const str = JSON.stringify(data, null, 4);

            console.log(str);
        }
        else
        {
            console.log(`${data.messages.length} messages`);

            data.messages.forEach((message) =>
            {
                console.log(`${message.level} : ${message.message}`);
            });
        }
    })
    .catch((error) =>
    {
        console.log(error);
    });
}

const args = process.argv.slice(2);

main(args);

