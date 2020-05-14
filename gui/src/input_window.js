import {
    QGridLayout,
    QMainWindow,
    QWidget, WidgetEventTypes
} from '@nodegui/nodegui';

import CustomView from "./custom_view.js";
import SchemaUrlInput from "./schema_URL_Input.js";
import FilterURLInput  from "./filter_URL_Input.js";
import VerifyButton from "./verify_Button";
import LocationPicker from "./location_picker";
import SchemaPicker from "./schema_picker";
import OdenIndexJson, {OdenIndexJSON} from "./oden_index";
import SearchBar from "./search_bar";
import FilterPicker from './filter_picker';
import ArgumentBox from "./argument_box";
import SourceURLInput from "./source_url_input";
import ResetButton from "./reset_button";


class InputWindow extends QMainWindow {

    constructor(cmdArgments) {
        super();
        //testing... to be remove
        if(cmdArgments){
            console.log("locality arg: ", cmdArgments[0]);
            console.log("type arg: ", cmdArgments[1]);
            console.log("fromFormat arg: ", cmdArgments[2]);
            console.log("toFormat arg: ", cmdArgments[3]);
            console.log("language arg: ", cmdArgments[4]);
        }

        const centralWidget = new QWidget();
        centralWidget.setObjectName("myroot");
        const layout = new QGridLayout();
        centralWidget.setLayout(layout);
        this.setWindowTitle("ODEN");

        this.input = {
            location: null,
            schema: null,
            dataset: null,
            filter: null
        }

        const index = new OdenIndexJSON("src\\db\\database.json");

        this.schemaSelect = new SchemaPicker(index);
        this.locationSelect = new LocationPicker(index);
        this.schemaSelect.setObjectName("schema_selection");
        this.locationSelect.setObjectName("location_selection");
        this.filterPicker = new FilterPicker();
        this.filterPicker.setObjectName("filter_selection");
        this.schemaURL= new SchemaUrlInput();
       // this.schemaURL.setInlineStyle("padding: 200px");
        //this.filterURl = new FilterURLInput();
        //this.schemaURL.setInlineStyle("padding: 200px");
        this.filterURL = new FilterURLInput();
        this.sourceURL= new SourceURLInput();
        this.argumentBox = new ArgumentBox();
        this.verifyButton = new VerifyButton();
        this.resetButton = new ResetButton();
        this.filterPicker = new FilterPicker();
        this.filterPicker.setObjectName("filter_selection");

        this.locationSelect.addEventListener("locationClick", (location) => {
            console.log("input object", this.input);
            this.input.location = location;
            if(this.input.schema != null){
                this.input.location.datasets.forEach((dataset)=>{
                    if(dataset.schemaName == this.input.schema){
                        this.filterPicker.setDataset(dataset);
                        this.input.dataset = dataset;
                    }
                });
            }
            else if(location.datasets){
                this.schemaSelect.setDatasets(location.datasets);
            }
            this.argumentBox.updateArguments(this.input);
        });
        this.locationSelect.addEventListener("locationBack", () => {
            this.input.schema = null;
            this.input.dataset = null;
            this.filter = null
            this.input.location = this.locationSelect.current;
            if(this.input.location && this.input.location.datasets){
                this.schemaSelect.setDatasets(this.input.location.datasets);
            }
            this.argumentBox.updateArguments(this.input);
        });
        this.schemaSelect.addEventListener("schemaClick", (schemaName, schemaUrl) => {
            console.log("input object", this.input);
            this.schemaURL.setSchemaURL(schemaUrl);
            this.input.schema = schemaName;
            if(this.input.location == null){
                this.locationSelect.setLocations(this.locationSelect.index.getDatasets(schemaName));
            } else {
                this.input.location.datasets.forEach((dataset)=>{
                    let found = false;
                    if(dataset.schemaName == this.input.schema){
                        this.input.dataset = dataset;
                        this.filterPicker.setDataset(dataset);
                        found = true;
                    }
                    if(!found){
                        this.locationSelect.setLocations(this.locationSelect.index.getDatasets(schemaName));
                    }
                });
            }
            this.argumentBox.updateArguments(this.input);
            console.log("input after dataset selected", this.input);
        });
        this.schemaSelect.addEventListener("schemaSearch", () =>{
            console.log("Schema")
            this.input.location = null;
            this.input.schema = null;
            this.input.dataset = null;
            this.filter = null
            this.argumentBox.updateArguments(this.input);
        });


        this.filterPicker.addEventListener("filterSelect", (filter)=>{
            this.input.filter = filter;
            this.filterURL.setFilterUrl(filter.url);

            this.sourceURL.setSourceURL(this.input.dataset.data[filter.inputType]);
            this.argumentBox.updateArguments(this.input);
        });

        this.verifyButton.b.addEventListener(WidgetEventTypes.MouseButtonPress, ()=>{
            console.log("verify pressed");
            try {
                let input = Object.assign({}, this.input);
                if (this.schemaURL.c.isChecked()) {
                    input.Override_Schema = this.schemaURL.getSchemaURL();
                }
                if (this.filterURL.c.isChecked()) {
                    input.Override_Filter = this.filterURL.getFilterURL();
                }
                if (this.sourceURL.c.isChecked()) {
                    input.Override_Source = this.sourceURL.getSourceURL();
                }
                console.log("modified input", input);
                this.verifyButton.verify( input);
            } catch (e) {
                console.log(e);
            }

        });

        this.resetButton.b.addEventListener(WidgetEventTypes.MouseButtonPress, ()=>{
            this.resetButton.resetAll([this.schemaSelect, this.locationSelect, this.filterPicker]);
            [this.filterURL, this.schemaURL, this.sourceURL].forEach((item) => {item.ResetInput(); item.ResetCheckBox();});
            this.input.location = null;
            this.input.schema = null;
            this.input.dataset = null;
            this.input.filter = null;
            this.argumentBox.updateArguments(this.input);
        });
        if(cmdArgments){
            this.schemaURL.loadCmdArgument(cmdArgments);
            this.filterURL.loadCmdArgument(cmdArgments);
            this.argumentBox.loadCmdArgument(cmdArgments);
            this.locationSelect.loadCmdArgument(cmdArgments);
            this.schemaSelect.loadCmdArgument(cmdArgments);
            this.filterPicker.loadCmdArgument(cmdArgments);
        }
        layout.addWidget(this.sourceURL,7,0,2,2)
        layout.addWidget(this.filterPicker, 3,0,2,2);
        layout.addWidget(this.schemaURL, 5, 0, 2, 2);
        layout.addWidget(this.filterURL,6,0,2,2)
        layout.addWidget(this.verifyButton,9,1, 3,1);
        layout.addWidget(this.resetButton,9,0, 3,1);
        layout.addWidget(this.schemaSelect, 0, 0, 3,1);
        layout.addWidget(this.locationSelect, 0, 1, 3,1);

        layout.addWidget(this.argumentBox,8,0,2,2);

        this.setCentralWidget(centralWidget);
        this.setStyleSheet(`
            #myroot {
            background-color: #92CC6F;
            }
            #schema_selection {
              background-color: #92CC6F ;

            }
            #location_selection {        
              background-color: #92CC6F ;
              /*border:  1px solid black;*/
            }
            
            #filter_selection {
              background-color: #92CC6F ;
            }
        `
        );
        this.show();
        this.resize(1000,1000);
        global.this = this;
    }
}

export default InputWindow;
