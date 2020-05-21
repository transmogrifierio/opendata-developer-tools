const jp = require('jsonpath');
const fs = require('fs');

class OdenIndex{
    // Returns an array of locations that are located within the provided locaton
    getLocationChildren(location){
        throw "must override OdenIndex.getLocationChildren()";
    }

    // Gets all datasets of the provided type. For example 'Public Art' would return an array of all Datasets of Public Art
    getDatasets(dataType){
        throw "must override OdenIndex.getDatasets()";
    }

    // Returns array of the highest level (largest) locations
    getRootLocations(){
        throw "must override OdenIndex.getRootLocations()";
    }

    getSchemas(){
        throw "must override OdenIndex.getSchemas()";
    }
}

class Dataset{
    constructor(schemaName, data, filters) {
        // Key value pair, file-type:url
        this.data = data;
        this.schemaName = schemaName;
        // key value pair, input-file-type, filter array
        this.filters = filters;
    }
}

class Filter {
    constructor(url, inputType, outputType, language) {
        this.url = url;
        this.inputType = inputType;
        this.outputType = outputType;
        this.language = language;
    }
}

class Location{
    constructor(name, path, datasets) {
        this.name = name;
        this.path = path;
        this.datasets = datasets;
    }

    /**
     * Format's the locations path in a user friendly string
     * @returns {string} formated name
     */
    getFullName(){
        // This parsing could be improved
        let result = this.path.substring(10).replace(/[\[\]&]+/g,"").replace(/[\"\.&]+/g,"/");
        if (result.endsWith("/")){
            result = result.substring(0, result.length - 1);
        }
        if (result.charAt(0)=='/'){
            result = result.substring(1, result.length);
        }
        return result;
    }
}

class OdenIndexJSON{

    constructor(path) {
        let rawData = fs.readFileSync(path, 'utf8');
        this.data = JSON.parse(rawData);
    }

    // Returns an array of locations that are located within the provided location
    getLocationChildren(location){
        let children = jp.query(this.data, location.path);
        let childrenList = [];
        for(let i = 0; i < Object.keys(children[0]).length; i++){
            let key = Object.keys(children[0])[i];
            if(key == 'data'){
                continue;
            }
            childrenList.push(this.parseLocation(key, location, children[0][key]['data']));
        }
        return childrenList;
    }

    /**
     * Parses a location object from arguments
     * @param name String name of location
     * @param parent Location
     * @param datasets Datasets of this location, null allowed
     * @returns {Location} parsed Location
     */
    parseLocation(name, parent, datasets){
        if(datasets){
            datasets = this.parseDatasets(datasets);
        }
        return new Location(name, parent.path + `["${name}"]`, datasets);
    }

    /**
     * Parses a location's datasets from JSON
     * Based on the schema of database.json, this function parses an object
     * stored under the key named 'data'
     * @param datasets String of Dataset in JSON format
     * @returns {[]} Array of Datasets
     */
    parseDatasets(datasets){
        let schemaKeyList = Object.keys(datasets);
        let sets = [];
        for(let i = 0; i < schemaKeyList.length; i++){
            let data = this.parseData(datasets[schemaKeyList[i]]);
            let filters = this.parseFilters(datasets[schemaKeyList[i]]);
            sets.push(new Dataset(schemaKeyList[i], data, filters));
        }
        return sets;
    }

    /**
     * Parses the data formats and urls of a specific dataset
     * @param data String of a Dataset's data in JSON format, all data under a specifc schema name
     * within a location
     * @returns {{}} Object with key/value pairs of data format / url
     */
    parseData(data){
        let parsedData = {};
        let formats = Object.keys(data);
        for(let i = 0; i < formats.length; i++){
            parsedData[formats[i]] = data[formats[i]]['url'];
        }
        return parsedData;
    }

    /**
     * Parses the available filters for a particular dataset
     * @param data String of a Dataset's data in JSON format, all data under a specifc schema name
     * within a location
     * @returns {{}} Object with key/value pairs of input data format / Array of filters
     */
    parseFilters(data){
        // Triple nested loop here could be improved
        let filters = {}
        // For each file format this dataset is in
        for(let i = 0; i < Object.keys(data).length; i++){
            let current = Object.keys(data)[i];
            filters[current] = jp.query(data, `$.${current}..filters`);
            let filtersByFormat = [];
            // For each output type found amoung this input type's filter
            for(let j = 0; j < filters[current].length; j++){
                let outputType = Object.keys(filters[current][j])[0];
                // For each filter (We now know input and output type)
                for(let k = 0; k < filters[current][j][outputType].length; k++){
                    let language = filters[current][j][outputType][k]['language'];
                    let url = filters[current][j][outputType][k]['url'];
                    filtersByFormat.push(new Filter(url, current, outputType, language));
                }
            }
            filters[current] = filtersByFormat;
        }
        return filters;
    }

    // Gets all datasets of the provided type. For example 'Public Art' would return an array of all Location with Datasets of Public Art
    getDatasets(dataType){
        let paths = jp.paths(this.data, `$..*[?(@.data['${dataType}'])]`);
        let locations = [];
        for(let i = 0; i < paths.length; i++){
            let datasets = this.parseDatasets(jp.value(this.data, jp.stringify(paths[i]))["data"]);
            locations.push(new Location(paths[i][paths[i].length - 1], jp.stringify(paths[i]), datasets));
        }
        return locations;
    }

    /**
     * Gets the parent of a location
     * @param location Location to find parent of
     * @returns {Location|null} Parent of location, or null if location is a root location
     */
    getLocationParent(location){
        let search = jp.paths(this.data, location.path)[0];
        search.splice(-1, 1);
        //If this is a root location
        if(search.length == 2){
            return null;
        }

        let name = search[search.length - 1];
        search = jp.stringify(search);
        let parent = jp.value(this.data, search);
        let datasets = parent['data'] ? this.parseDatasets(parent['data']) : null;
        let p = new Location(name, search, datasets);
        return p;
    }

    // Returns array of the highest level (largest) locations
    getRootLocations(){
        let roots = Object.keys(this.data["filters"]);
        roots.splice(roots.indexOf("files"),1);
        let locations = [];
        for(let i = 0; i < roots.length; i++){
            let datasets = this.data["filters"].data ? this.parseDatasets(this.data["filters"].data) : null;
            locations.push(new Location(roots[i], `$.filters["${roots[i]}"]`, datasets))
        }
        return locations;
    }

    /**
     * Generates a location directly from command line arguments
     * @param arg path to generate location from. ex: CA/BC
     * @returns {Location} Location generated from arguments
     */
    getLocationFromArgument(arg){
        let nodes = arg.split('/');
        nodes.unshift('$', 'filters');
        let path = jp.stringify(nodes);
        let locationJson = jp.query(this.data, path);
        locationJson = locationJson[0];
        let dataset = locationJson['data'] ? this.parseDatasets(locationJson['data']) : null;
        let location = new Location(nodes[nodes.length - 1], path, dataset);
        return location;
    }

    /**
     * Gets all schemas defined in the database
     * @returns {{}} Object with key value pairs
     */
    getSchemas(){
        const rawSchemas = jp.query(this.data, "$.schemas.*");
        const schemas = {};
        for(let i = 0; i < rawSchemas.length; i++){
            Object.assign(schemas, rawSchemas[i]);
        }
        return schemas;
    }
}

module.exports = {
    OdenIndex: OdenIndex,
    OdenIndexJSON: OdenIndexJSON,
    Dataset: Dataset,
    Location: Location
}