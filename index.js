const YAML = require('js-yaml');
const _ = require('lodash');
const fs = require('fs/promises');
const process = require('process');

(async function run() {
    if (process.argv.length < 2) {
        console.error('missing file name\nUSAGE: node ./index.js YAML_FILE FIELD_NAME');
        return 1;
    }
    if (process.argv.length < 3) {
        console.error('missing field name\nUSAGE: node ./index.js YAML_FILE FIELD_NAME');
        return 1;
    }
    const fileName = process.argv[2];
    const fieldName = process.argv[3];
    console.log(`loading: ${fileName}`);
    const data = (await fs.readFile(fileName)).toString('utf-8');
    const origYaml = YAML.load(data);
    console.log(`loaded: ${fileName}`);

    const resObj = {};

    const recurse = (path) => {
        const curVal = _.get(origYaml, path);
        if (_.last(path.split('.')) === fieldName) {
            _.set(resObj, path, curVal);
            return;
        }

        if (typeof curVal !== 'object' || !curVal) {
            return;
        }

        for (const key of Object.keys(curVal)) {
            recurse(`${path}.${key}`);
        }
    };

    for (const key of Object.keys(origYaml)) {
        recurse(key);
    }

    await fs.writeFile('./out.yaml', YAML.dump(resObj, { indent: 2 }));
    console.log('done');
})()