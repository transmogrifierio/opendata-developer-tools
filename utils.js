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
function getEntryPath(locality, type, fromFormat)
{
    const values = locality.split('/');
    let entryPath = '$.filters';

    values.forEach((value) =>
    {
        entryPath += `['${value}']`;
    });

    entryPath += `.data['${type}']`
    entryPath += `['${fromFormat}']`

    return entryPath;
}

function getFilterPath(toFormat, language)
{
    const filterPath = `$.filters['${toFormat}'][?(@.language == '${language}')]`;

    return filterPath;
}

function getSchemaPath(type, toFormat)
{
    const schemaPath = `$.schemas['${toFormat}']['${type}']`;

    return schemaPath;
}

function getValidatorPath(toFormat)
{
    const validatorPath = `$.validators['${toFormat}']`;

    return validatorPath;
}

function getFilesPath(language)
{
    const filesPath = `$.filters.files['${language}']`;

    return filesPath;
}

async function downloadToFile(url, path)
{
    const writer = fs.createWriteStream(path)
    const response = await Axios(
        {
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
            const urlPath  = URL.parse(info).pathname;
            const fileName = Path.basename(urlPath);
            const path     = Path.resolve('./', '.files', fileName);

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

export default async function performValidation(locality, type, fromFormat, toFormat, language, databaseFile)
{
    const entryPath = getEntryPath(locality, type, fromFormat);
    const filterPath = getFilterPath(toFormat, language);
    const schemaPath = getSchemaPath(type, toFormat);
    const validatorPath = getValidatorPath(toFormat);
    const filesPath = getFilesPath(language);
    const database = readJSONFromFile(databaseFile);
    const entry        = jasonpath.query(database, entryPath)[0];
    const filterEntry  = jasonpath.query(entry, filterPath)[0];
    const schemaURL    = jasonpath.query(database, schemaPath)[0];
    const validatorURL = jasonpath.query(database, validatorPath)[0];
    const files        = jasonpath.query(database, filesPath)[0];
    const sourceURL    = entry.url;
    const filterURL    = filterEntry;
    const data         = {};

    return download([sourceURL, filterURL, schemaURL, validatorURL, ...files])
    .then(async (downloads) =>
    {
        const sourceDownload    = downloads[0];
        const filterDownload    = downloads[1];
        const schemaDownload    = downloads[2];
        const validatorDownload = downloads[3];

        const filterModule = await import(filterDownload);
        const filter       = new filterModule.default;
        const source       = readJSONFromFile(sourceDownload);
        const {validate}   = await import(validatorDownload);
        const schema       = readJSONFromFile(schemaDownload);

        data["source"] = source;
        data["schema"] = schema;
        data["validate"] = validate;

        const filteredData = filter.filter(data.source);

        return filteredData
    })
    .then((filteredData) =>
    {
        const validate = data.validate;

        delete data.validate;
        data["filtered"] = filteredData;

        return validate(filteredData, data.schema);
    })
    .then((messages) =>
    {
        data["messages"] = messages;

        return data;
    });
}