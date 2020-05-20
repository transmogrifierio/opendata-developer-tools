import Data_window from "./data_window";

const {
    QWidget, QPushButton, QGridLayout
} = require('@nodegui/nodegui');


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

    /**
     * grab inputs from input_window and pass correct inputs for performValidation.
     * @param input QMainWindow
     * @param options String
     */
    verify(input, options){
        if(input.filter != null && input.filter != null && input.dataset != null){
            try{
                let params = {
                    locality: input.location.getFullName(),
                    type: input.dataset.schemaName,
                    fromFormat: input.filter.inputType,
                    toFormat: input.filter.outputType,
                    language: input.filter.language,
                    '--source': input.Override_Source,
                    '--schema': input.Override_Schema,
                    '--filter': input.Override_Filter
                }
                console.log("parameters", params);
                this.performValidation(params, options)
            } catch(e){
                console.log(e);
            }
        }
    }

    /**
     * perform child-process for index.js to output original-data, filtered-data, message, and warnings.
     * @param params locality, type, from, to, language, source_url, schema_url, and filter_url
     * @param options option-flags such as -c, -f, or --help
     */
    performValidation(params, options){
        const childProcess = require("child_process");
        const path = require("path");
        if(options){
            let cmd = `node --experimental-modules --experimental-json-modules ./index.js `;
            cmd += `-p ${options} `;
            cmd += `--locality "${params.locality}" `;
            cmd += `--type "${params.type}" --from ${params.fromFormat} `;
            cmd += `--to ${params.toFormat} `;
            cmd += `--lang ${params.language} `;
            cmd += `-d ./gui/src/db/database.json `;

            for(let override of ['--source', '--schema', '--filter']){
                if(params[override]){
                    cmd += ` ${override} ${params[override]}`
                }
            }

            const cp = childProcess.exec(cmd,
                {
                    cwd: `./${__dirname}../`
                },
                (error, stdout, stderr) =>
                {
                    console.log(error);
                    console.log("flag:", options, "has successfully passed-in.");
                    const obj = JSON.parse(stdout);
                    this.dataWindow = new Data_window();
                    this.dataWindow.DisplayMessages(obj);
                    this.dataWindow.show();
                    console.log(stderr);
                });
        } else {
            let cmd = `node --experimental-modules --experimental-json-modules ./index.js -p `;
            cmd += `--locality "${params.locality}" `;
            cmd += `--type "${params.type}" --from ${params.fromFormat} `;
            cmd += `--to ${params.toFormat} `;
            cmd += `--lang ${params.language} `;
            cmd += `-d ./gui/src/db/database.json `;

            for(let override of ['--source', '--schema', '--filter']){
                if(params[override]){
                    cmd += ` ${override} ${params[override]}`
                }
            }
            const cp = childProcess.exec(cmd,
                {
                    cwd: `./${__dirname}../`
                },
                (error, stdout, stderr) =>
                {
                    console.log(error);
                    const obj = JSON.parse(stdout);
                    this.dataWindow = new Data_window();
                    this.dataWindow.DisplayMessages(obj);
                    this.dataWindow.show();
                    console.log(stderr);
                });
        }

    }

}

export default VerifyButton;