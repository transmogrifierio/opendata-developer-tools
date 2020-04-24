"use strict";

function makeKeyName(path, name)
{
    let keyName;

    if(path === "")
    {
        if(name)
        {
            keyName = name;
        }
        else
        {
            keyName = "";
        }
    }
    else
    {
        if(name)
        {
            keyName = `${path}.${name}`
        }
        else
        {
            keyName = path;
        }
    }

    return keyName;
}

function checkObject(path, name, object, schema)
{
    const messages = [];

    if(typeof object === 'object' && object !== null)
    {
        let requiredProperties = new Set();
        let expectedProperties = new Set();

        if(schema.hasOwnProperty("required"))
        {
            requiredProperties = new Set(schema.required);
        }

        if(schema.hasOwnProperty("properties"))
        {
            expectedProperties = new Set(Object.getOwnPropertyNames(schema.properties));
        }

        const actualProperties = new Set(Object.getOwnPropertyNames(object));
        const seenProperties = new Set();

        actualProperties.forEach((propertyName) =>
        {
            if(expectedProperties.has(propertyName))
            {
                seenProperties.add(propertyName);
            }
            else
            {
                const keyName = makeKeyName(path, propertyName);

                messages.push(`unexpected key ${keyName}`);
            }
        });

        requiredProperties.forEach((propertyName) =>
        {
            if(!(seenProperties.has(propertyName)))
            {
                const keyName = makeKeyName(path, propertyName);

                messages.push(`missing required key ${keyName}`);
            }
        });

        expectedProperties.forEach((propertyName) =>
        {
            if(seenProperties.has(propertyName))
            {
                const keyName = makeKeyName(path, propertyName);

                const newMessages = check(keyName, null, object[propertyName], schema.properties[propertyName]);

                messages.push(...newMessages);
            }
        });

        return messages;
    }
    else
    {
        const keyName = makeKeyName(path, name);

        if(keyName)
        {
            messages.push(`${keyName} must be an object`);
        }
        else
        {
            messages.push(`must start with an object`);
        }
    }

    return messages;
}

function checkArray(path, name, array, schema)
{
    const keyName = makeKeyName(path, name);
    const messages = [];

    if(Array.isArray(array))
    {
        if(schema.hasOwnProperty("maxItems"))
        {
            if(array.length > schema.maxItems)
            {
                messages.push(`${keyName}: ${array} must have at most ${schema.maxItems} items`);
            }
        }

        if(schema.hasOwnProperty("minItems"))
        {
            if(array.length < schema.minItems)
            {
                messages.push(`${keyName}: ${array} must have at least ${schema.minItems} items`);
            }
        }

        if(schema.hasOwnProperty("uniqueItems"))
        {
            throw "need to test uniqueItems";
        }

        if(schema.hasOwnProperty("maxContains"))
        {
            throw "need to test maxContains";
        }

        if(schema.hasOwnProperty("minContains"))
        {
            throw "need to test minContains";
        }

        array.forEach((item, index) =>
        {
            if(schema.hasOwnProperty("items"))
            {
                const newMessages = check(`${keyName}[${index}]`, null, item, schema.items);

                messages.push(...newMessages);
            }
        });
    }
    else
    {
        messages.push(`${keyName} must be an array`);
    }

    return messages;
}


function checkNumber(path, name, num, schema)
{
    const keyName = makeKeyName(path, name);
    const messages = [];

    if(Number.isNaN(num))
    {
        messages.push(`${keyName} must be a number`);
    }
    else
    {
        if(schema.hasOwnProperty("multipleOf"))
        {
            throw "need to test multipleOf";
        }

        if(schema.hasOwnProperty("maximum"))
        {
            if(num > schema.maximum)
            {
                messages.push(`${keyName}: ${num} must be <= ${schema.maximum}`);
            }
        }

        if(schema.hasOwnProperty("exclusiveMaximum"))
        {
            if(num >= schema.exclusiveMaximum)
            {
                messages.push(`${keyName}: ${num} must be < ${schema.exclusiveMaximum}`);
            }
        }

        if(schema.hasOwnProperty("minimum"))
        {
            if(num < schema.minimum)
            {
                messages.push(`${keyName}: ${num} must be >= ${schema.minimum}`);
            }
        }

        if(schema.hasOwnProperty("exclusiveMinimum"))
        {
            if(num >= schema.exclusiveMinimum)
            {
                messages.push(`${keyName}: ${num} must be > ${schema.exclusiveMinimum}`);
            }
        }

        if(schema.hasOwnProperty("enum"))
        {
            if(!(schema.enum.includes(num)))
            {
                messages.push(`${keyName} must be one of: ${schema.enum}`)
            }
        }

        if(schema.hasOwnProperty("const"))
        {
            throw "need to test const";
        }
    }

    return messages;
}

function checkString(path, name, str, schema)
{
    const keyName = makeKeyName(path, name);
    const messages = [];

    if(typeof str === 'string' || typeof str instanceof String)
    {
        if(schema.hasOwnProperty("minLength"))
        {
            if(str.length < schema.minLength)
            {
                messages.push(`${keyName}: ${str} must be at least ${schema.minLength} characters`);
            }
        }

        if(schema.hasOwnProperty("maxLength"))
        {
            if(str.length > schema.maxLength)
            {
                messages.push(`${keyName}: ${str} must be at smaller than ${schema.maxLength} characters`);
            }
        }

        if(schema.hasOwnProperty("pattern"))
        {
            if(str.search(schema.pattern))
            {
                messages.push(`${keyName}: ${str} must match pattern: ${schema.pattern}`);
            }
        }

        if(schema.hasOwnProperty("enum"))
        {
            if(!(schema.enum.includes(str)))
            {
                messages.push(`${keyName} must be one of: ${schema.enum}`)
            }
        }

        if(schema.hasOwnProperty("const"))
        {
            throw "need to test const";
        }
    }
    else
    {
        messages.push(`${keyName} must be a string: ${JSON.stringify(str, null, 4)}`);
    }

    return messages;
}

const CHECKERS = new Map();
CHECKERS.set("null", null);
CHECKERS.set("boolean", null);
CHECKERS.set("object", checkObject);
CHECKERS.set("array", checkArray);
CHECKERS.set("number", checkNumber);
CHECKERS.set("string", checkString);
CHECKERS.set("integer", null);

function check(path, name, entity, schema)
{
    const keyName = makeKeyName(path, name);
    const type = schema.type;
    const checker = CHECKERS.get(type);

    if(!(checker))
    {
        throw `invalid type: ${type} in schema}`;
    }

    const messages = checker(keyName, name, entity, schema);

    return messages;
}

export function validate(data, schema)
{
    return new Promise((resolve, reject) =>
    {
        const messages = check("", null, data, schema);

        resolve(messages));
    });
}
