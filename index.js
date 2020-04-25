"use strict";

import fs from 'fs';
import URL from 'url';
import jasonpath from 'jsonpath';
import Axios from 'axios';
import Path from 'path';

function readJSONFromFile(file)
{
    let rawData = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(rawData);

    return json;
}

// https://github.com/dchester/jsonpath
function createPaths(locality, type, fromFormat, toFormat, language)
{
    const values = locality.split('/');
    let entryPath = '$.filters';

    values.forEach((value) =>
    {
        entryPath += `['${value}']`;
    });

    entryPath += `.data['${type}']`
    entryPath += `['${fromFormat}']`

    const filterPath = `$.filters['${toFormat}'][?(@.language == '${language}')]`;
    const schemaPath = `$.schemas['${toFormat}']['${type}']`;
    const validatorPath = `$.validators['${toFormat}']`;
    const filesPath = `$.filters.files['${language}']`;

    return {entryPath, filterPath, schemaPath, validatorPath, filesPath};
}

async function downloadToFile(url, path)
{
    const writer = fs.createWriteStream(path)
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer)

    return new Promise((resolve, reject) =>
    {
        writer.on('finish', () => { resolve(path); });
        writer.on('error', reject)
    })
}

function download(dowloads)
{
    const promises = [];
    const dir = Path.resolve('./', '.files');

    if(!(fs.existsSync(dir)))
    {
        fs.mkdirSync(dir);
    }

    dowloads.forEach((info) =>
    {
        if(typeof info === 'string')
        {
            const urlPath = URL.parse(info).pathname;
            const fileName = Path.basename(urlPath);
            const path = Path.resolve('./', '.files', fileName);

            promises.push(downloadToFile(info, path));
        }
        else
        {
            const path = Path.resolve('./', '.files', info.path);

            if(!(fs.existsSync(Path.dirname(path))))
            {
                fs.mkdirSync(Path.dirname(path), {recursive: true});
            }

            promises.push(downloadToFile(info.url, path));
        }
    });

    return Promise.all(promises);
}

async function main(argv)
{
    const locality     = argv[0];  // "CA/BC/Metro Vancouver Regional District/New Westminster"
    const type         = argv[1];  // "Public Art"
    const language     = argv[2];  // ES6
    const fromFormat   = argv[3];  // json
    const toFormat     = argv[4];  // json
    const databaseFile = argv.length > 5 ? argv[5] : "./database.json"
    const database     = readJSONFromFile(databaseFile);

    const {entryPath, filterPath, schemaPath, validatorPath, filesPath} = createPaths(locality, type, fromFormat, toFormat, language);

    const entry        = jasonpath.query(database, entryPath)[0];
    const filterEntry  = jasonpath.query(entry, filterPath)[0];
    const schemaURL    = jasonpath.query(database, schemaPath)[0];
    const validatorURL = jasonpath.query(database, validatorPath)[0];
    const files        = jasonpath.query(database, filesPath)[0];
    const sourceURL    = entry.url;
    const filterURL    = filterEntry;
    const data = {};

    download([sourceURL, filterURL, schemaURL, validatorURL, ...files])
    .then(async (downloads) =>
    {
        const sourceDownload = downloads[0];
        const filterDownload = downloads[1];
        const schemaDownload = downloads[2];
        const validatorDownload = downloads[3];
        const filterModule = await import(filterDownload);
        const filter = new filterModule.default;
        const source = readJSONFromFile(sourceDownload);
        const {validate} = await import(validatorDownload);
        const schema = readJSONFromFile(schemaDownload);

        data["source"] = source;
        data["schema"] = schema;
        data["filter"] = filter;
        data["validate"] = validate;

        const filteredData = data.filter.filter(data.source);

        return filteredData
    })
    .then((filteredData) =>
    {
        data["filtered"] = filteredData;

        return data.validate(filteredData, data.schema);
    })
    .then((messages) =>
    {
        data["messages"] = messages;

        console.log(`${messages.length} messages`);

        messages.forEach((message) =>
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

