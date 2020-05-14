import DataWindow from "./dataWindow";
//import {processStuff} from "./level2/index3"

const { QWidget, QPushButton, FlexLayout, QGridLayout } = require('@nodegui/nodegui');

//////////////////////////////////////
const s = {
    type: 'FeatureCollection',
    name: 'PUBLIC_ART',
    features: [
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] }
    ]
}

const f = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] },
        { type: 'Feature', geometry: [Object], properties: [Object] }
    ]
}

class data{
    constructor(source, filtered) {
        this.messages = []
        this.filtered = filtered;
        this.source = source;
    }
}
const d = new data(s, f)
class message {
    constructor(level, mess, path) {
        this.level = level;
        this.message = mess;
        this.path = path;
    }
}
var i;
for (i = 0; i < 100; i++) {
    d.messages[i] = new message("Warning", "Hi, I am a warning", "features[21].properties");
}
d.messages[100] = new message("Error", "Uh Oh I am an Error", "features[1].properties");
///////////////////////////////////////////////////////


class VerifyButton extends QWidget{
    constructor(input_window) {
        super();
        this.setLayout(new QGridLayout());
        this.b = new QPushButton();
        this.b.setText("Verify");
        this.b.setFixedSize(160,60);
        this.b.setInlineStyle(`
        font: 22px;
`       );
        this.layout.addWidget(this.b,0,0);
    }

    verify(input){
        if(input.filter != null && input.filter != null && input.dataset != null){
            try{
                let params = {
                    locality: input.location.getFullName(),
                    type: input.dataset.schemaName,
                    fromFormat: input.filter.inputType,
                    toFormat: input.filter.outputType,
                    language: input.filter.language
                }
                console.log("parameters", params);
                this.performValidation(params)
            } catch(e){
                console.log(e);
            }
        }
    }

    performValidation(params){
        const childProcess = require("child_process");
        const path = require("path");
        console.log("locality type: " , params.locality)
        console.log("schema type: " , params.type)
        console.log("from type: " , params.fromFormat)
        console.log("to type: " , params.toFormat)
        console.log("language type: " , params.language)
        const cp = childProcess.exec(`node --experimental-modules --experimental-json-modules ./index.js -p "${params.locality}" "${params.type}" ${params.fromFormat} ${params.toFormat} ${params.language} ./gui/src/db/database.json`,
            {
                cwd: `./${__dirname}../`
            },
            (error, stdout, stderr) =>
            {
                console.log(error);
                const obj = JSON.parse(stdout);
                this.dataWindow = new DataWindow();
                this.dataWindow.DisplayMessages(obj);
                this.dataWindow.show();
                console.log(stderr);
            });
        cp.on("exit", (code, signal) =>
        {
            console.log("Exited", {code: code, signal: signal});
        });
        cp.on("error", console.error.bind(console));

    }

}

export default VerifyButton;