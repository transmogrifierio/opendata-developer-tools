"use strict";

import fs from 'fs';
import URL from 'url';
import jasonpath from 'jsonpath';
import Axios from 'axios';
import Path from 'path';
import moment from 'moment';

const DAY_IN_SECONDS = 24 * 60 * 60;

function readJSONFromFile(file)
{
    let rawData = fs.readFileSync(file, 'utf8');
    let json = JSON.parse(rawData);

    return json;
}

// https://github.com/dchester/jsonpath
function getEntryPath(locality, type, fromFormat)
{
    const filePath = `data/${locality}/${type}.${fromFormat}`;
    let path = '$.filters';
    const values = locality.split('/');

    values.forEach((value) =>
    {
        path += `['${value}']`;
    });

    path += `.data['${type}']`
    path += `['${fromFormat}']`

    return {filePath, path};
}

function getFilterPath(locality, type, fromFormat, toFormat, language)
{
    const filePath = `filters/${locality}/Filter-${type}-${fromFormat}-to-${toFormat}.js`;
    const path = `$.filters['${toFormat}'][?(@.language == '${language}')]`;

    return {filePath, path};
}

function getSchemaPath(type, toFormat)
{
    const filePath = `schemas/${type}.${toFormat}`;
    const path = `$.schemas['${toFormat}']['${type}']`;

    return {filePath, path};
}

function getValidatorPath(toFormat)
{
    // TODO: this doesn't work long-term
    const filePath = `validators/json_schema_validator.js`;
    const path = `$.validators['${toFormat}']`;

    return {filePath, path};
}

function getFilesPath(language)
{
    const filePath = `${language}`;
    const path = `$.filters.files['${language}']`;

    return {filePath, path};
}

function isExpired(path, options)
{
    let retVal;

    if(fs.existsSync(path))
    {
        const stat  = fs.statSync(path);
        const mtime = stat.mtime;
        const then  = moment(mtime);
        const now   = moment();
        const hours = then.diff(now, 'seconds');

        if(hours >= DAY_IN_SECONDS)
        {
            retVal = true;
        }
        else
        {
            retVal = false;

            if(path.indexOf(".files/data/") > -1 && options.clearData)
            {
                retVal = true;
            }
            else if(path.indexOf(".files/filters/") > -1 && options.clearFilters)
            {
                retVal = true;
            }
            else if(path.indexOf(".files/schemas/") > -1 && options.clearSchemas)
            {
                retVal = true;
            }
            else if(path.indexOf(".files/validators/") > -1 && options.clearValidators)
            {
                retVal = true;
            }
        }
    }
    else
    {
        retVal = true;
    }

    return retVal;
}

async function downloadToFile(url, path)
{
    const writer = fs.createWriteStream(path);
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
        writer.on('error', (error) => { reject(error) } );
    });
}

function download(downloads, options)
{
    const promises = [];
    const dir = Path.resolve('./', '.files');

    if(options.clearCache)
    {
        fs.rmdirSync(dir, {recursive: true});
    }

    if(!(fs.existsSync(dir)))
    {
        fs.mkdirSync(dir);
    }

    downloads.forEach((info) =>
    {
        const path = Path.resolve('./', '.files', info.path);

        if(!(fs.existsSync(Path.dirname(path))))
        {
            fs.mkdirSync(Path.dirname(path), {recursive: true});
        }

        const add = isExpired(path, options);
        let promise = null;

        if(add)
        {
            promise = downloadToFile(info.url, path);
        }
        else
        {
            promise = new Promise((resolve, reject) =>
            {
                resolve(path);
            });
        }

        promises.push(promise);
    });

    return Promise.all(promises);
}

export default async function performValidation(locality, type, fromFormat, toFormat, language, databaseFile, options)
{
    const entryInfo     = getEntryPath(locality, type, fromFormat);
    const filterInfo    = getFilterPath(locality, type, fromFormat, toFormat, language);
    const schemaInfo    = getSchemaPath(type, toFormat);
    const validatorInfo = getValidatorPath(toFormat);
    const filesInfo     = getFilesPath(language);
    const database      = readJSONFromFile(databaseFile);
    const entry         = jasonpath.query(database, entryInfo.path)[0];
    const filterEntry   = jasonpath.query(entry, filterInfo.path)[0].url;
    const schemaURL     = jasonpath.query(database, schemaInfo.path)[0];
    const validatorURL  = jasonpath.query(database, validatorInfo.path)[0];
    const files         = jasonpath.query(database, filesInfo.path)[0];
    const sourceURL     = entry.url;
    const filterURL     = filterEntry;
    const data          = {};
    const fileEntries   = [];

    files.forEach((file) =>
    {
        const parts = URL.parse(file);
        let filePath = parts.path;

        filePath = filePath.substring(filePath.lastIndexOf("/") + 1);
        filePath = `filters/${filePath}`;
        fileEntries.push({url: file, path: filePath });
    });

    return download([
        { url: sourceURL,    path: entryInfo.filePath     },
        { url: filterURL,    path: filterInfo.filePath    },
        { url: schemaURL,    path: schemaInfo.filePath    },
        { url: validatorURL, path: validatorInfo.filePath },
        ...fileEntries],
        options)
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