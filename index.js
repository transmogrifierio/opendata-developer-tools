"use strict";

import performValidation from './utils.js';
// import getValidationParameters from './utils.js';
import Getopt from 'node-getopt';

function main(argv)
{
    const getopt = new Getopt([
        [ 'c', 'clear-cache',         'delete the .files directory'],
        [ 'f', 'force-download=ARG+', 'do not check timestamp for files [all,data,filters,schemas,validators]'],
        [ 'p', 'print',               'print the result'],
        [ 'd', 'database=ARG',        'database file'],
        [ '',  'locality=ARG',        'the locality in the database'],
        [ '',  'type=ARG',            'the type'],
        [ '',  'from=ARG',            'from format'],
        [ '',  'to=ARG',              'to format'],
        [ '',  'lang=ARG',            'language'],
        [ '',  'source=ARG',          'source URL'],
        [ '',  'filter=ARG',          'filter URL'],
        [ '' , 'schema=ARG',          'schema URL'],
        [ '',  'help',                'help']
    ]).bindHelp();

    const opt     = getopt.parse(argv);
    const options = { };
    let locality     = null;
    let type         = null;
    let fromFormat   = null;
    let toFormat     = null;
    let language     = null;
    let databaseFile = null;
    let sourceURL    = null;
    let filterURL    = null;
    let schemaURL    = null;

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

    if(opt.options.hasOwnProperty("locality"))
    {
        locality = opt.options.locality; // "CA/BC/Metro Vancouver Regional District/New Westminster"
    }
    else
    {
        throw "--locality is required";
    }

    if(opt.options.hasOwnProperty("type"))
    {
        type = opt.options.type; // "Public Art"
    }
    else
    {
        throw "--type is required";
    }

    if(opt.options.hasOwnProperty("from"))
    {
        fromFormat = opt.options.from; // json
    }
    else
    {
        throw "--from is required";
    }

    if(opt.options.hasOwnProperty("to"))
    {
        toFormat = opt.options.to; // json
    }
    else
    {
        throw "--to is required";
    }

    if(opt.options.hasOwnProperty("lang"))
    {
        language = opt.options.lang; // ES6
    }
    else
    {
        throw "--lang is required";
    }

    if(opt.options.hasOwnProperty("database"))
    {
        databaseFile = opt.options.database;
    }
    else
    {
        databaseFile = "./database.json";
    }

    if(opt.options.hasOwnProperty("source"))
    {
        sourceURL = opt.options.source;
    }

    if(opt.options.hasOwnProperty("filter"))
    {
        filterURL = opt.options.filter;
    }

    if(opt.options.hasOwnProperty("schema"))
    {
        schemaURL = opt.options.schema;
    }

    performValidation(options, locality, type, fromFormat, toFormat, language, databaseFile, sourceURL, filterURL, schemaURL)
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

