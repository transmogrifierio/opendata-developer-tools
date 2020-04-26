"use strict";

import performValidation from './utils.js';

function main(argv)
{
    const locality     = argv[0]; // "CA/BC/Metro Vancouver Regional District/New Westminster"
    const type         = argv[1]; // "Public Art"
    const fromFormat   = argv[2]; // json
    const toFormat     = argv[3]; // json
    const language     = argv[4]; // ES6
    const databaseFile = argv.length > 5 ? argv[5] : "./database.json";

    performValidation(locality, type, fromFormat, toFormat, language, databaseFile)
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

