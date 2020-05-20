import InputWindow from "./input_window";
import Getopt from 'node-getopt';

/**
 * Array contains [locality, type, from, to, language] values from arguments.
 */
let argv_array = [];

/**
 *  Pre-define optional flags.
 */
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

const opt = getopt.parse(process.argv);

if (Object.keys(opt.options).length===0){
    // npm start
    new InputWindow(null);
} else{
    // npm start -- [options]
    let option_flag = "";

    if(opt.options.hasOwnProperty("help")){
        option_flag += "--help "
    }
    if(opt.options.hasOwnProperty("clear-cache"))
    {
        option_flag += "-c ";
    }

    if(opt.options.hasOwnProperty("force-download"))
    {
        const downloads = opt.options["force-download"];
        option_flag += "-f " + downloads;
    }
    if(opt.options.hasOwnProperty("database"))
    {
        option_flag += "-d " + opt.options.database;
    }
    else
    {
        option_flag += "-d " + "./gui/src/db/database.json ";
    }
    // provided info from arguments
    if(opt.options.hasOwnProperty("locality") ||
        opt.options.hasOwnProperty("type") ||
        opt.options.hasOwnProperty("from") ||
        opt.options.hasOwnProperty("to") ||
        opt.options.hasOwnProperty("lang")) {

        if(opt.options.hasOwnProperty("locality"))
        {
            argv_array.push(opt.options.locality);
        }
        else
        {
            throw "--locality is required";
        }

        if(opt.options.hasOwnProperty("type"))
        {
            argv_array.push(opt.options.type); // "Public Art"
        }
        else
        {
            throw "--type is required";
        }

        if(opt.options.hasOwnProperty("from"))
        {
            argv_array.push(opt.options.from); // json
        }
        else
        {
            throw "--from is required";
        }

        if(opt.options.hasOwnProperty("to"))
        {
            argv_array.push(opt.options.to); // json
        }
        else
        {
            throw "--to is required";
        }

        if(opt.options.hasOwnProperty("lang"))
        {
            argv_array.push(opt.options.lang); // ES6
        }
        else
        {
            throw "--lang is required";
        }

        // npm start -- --locality "CA/BC/Metro Vancouver Regional District/New Westminster" --type "Public Art"
        // -from json --to json --lang ES6 -f all -f filter
        new InputWindow(argv_array, option_flag);
    } else {
        //npm start -- -c
        new InputWindow(null, option_flag);

    }


}

class data{
    constructor() {
        this.messages = []
    }
}
const d = new data()
class message {
    constructor(level, mess) {
        this.level = level
        this.message = mess
    }
}
var i;
for (i = 0; i < 100; i++) {
    d.messages[i] = new message("Warning", "Hi, I am a warning");
}
d.messages[100] = new message("Error", "Uh Oh I am an Error");

class Transformer {
    transform(message) {
        return message.toLowerCase();
    }
}
