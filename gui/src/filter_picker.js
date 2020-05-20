import {
    QGridLayout, QComboBox, QLabel, QWidget
} from "@nodegui/nodegui";

const oden_index = require('./oden_index.js');

class FilterPicker extends QWidget {
    constructor() {
        super();
        this.setLayout(new QGridLayout());


        this.inputBox = new QComboBox();
        this.inputBox.setObjectName("inputBox");
        this.inputBox.addEventListener('currentTextChanged', (text)=> { this.populateFilterBox(text) });

        this.filterBox = new QComboBox();
        this.filterBox.setObjectName("filterBox");
        this.filterBox.addEventListener('currentTextChanged', (text)=> { this.filterSelect(text) });

        this.inputLabel = new QLabel();
        this.inputLabel.setObjectName("inputLabel");
        this.inputLabel.setText("Input Format");

        this.filterLabel = new QLabel();
        this.filterLabel.setObjectName("filterLabel");
        this.filterLabel.setText("Output Format & Filter Language");


        this.layout.addWidget(this.inputLabel, 0, 0);
        this.layout.addWidget(this.inputBox, 1, 0);
        this.layout.addWidget(this.filterLabel, 2, 0);
        this.layout.addWidget(this.filterBox, 3, 0);

        this.dataset = null;
        this.inputType = "";
        this.current = null;

        this.events = {
            "filterSelect": []
        }
    }

    filterSelect(text){
        try{
            let filter = this.getFilter();
            if(filter){
                this.events["filterSelect"].forEach((e) => { e(filter) });
            }
        } catch(e){
            console.log(e);
        }
    }

    getFilter(){
        if(this.filterBox.currentIndex() != 0){
            return this.dataset.filters[this.inputType][this.filterBox.currentIndex() - 1];
        } else {
            return null;
        }
    }

    setDataset(dataset){
        console.log("Setting dataset");
        this.dataset = dataset
        this.resetFields();
        this.populateInputBox();

    }

    populateInputBox(){
        this.inputBox.addItem(undefined, "");
        this.inputBox.addItems(Object.keys(this.dataset.data));
        if(Object.keys(this.dataset.data).length == 1){
            this.inputBox.setCurrentIndex(1);
        }
    }

    populateFilterBox(inputType){
        this.filterBox.clear();
        this.inputType = inputType;
        if(inputType != "" && this.dataset.filters[inputType] != undefined){
            this.filterBox.addItem(undefined, "");
            for(let filter of this.dataset.filters[inputType]){
                this.filterBox.addItem(undefined, `${filter.outputType}/${filter.language}`);
            }
            if(this.dataset.filters[inputType].length == 1){
                this.filterBox.setCurrentIndex(1);
            }
        }
    }

    resetFields(){
        this.inputBox.clear();
        this.filterBox.clear();
    }

    reset(){
        this.resetFields();
        this.dataset = null;
        this.inputType = "";
    }
    loadCmdArgument(cmdArgments) {
        this.inputBox.setCurrentText(cmdArgments[2]);
        this.filterBox.setCurrentText(cmdArgments[3]+"/"+cmdArgments[4])
    }

    loadCmdArgument(arg){
        this.inputBox.setCurrentText(arg[2]);
        if(this.filterBox.currentIndex() == 0){
            this.filterBox.setCurrentText(`${arg[3]}/${arg[4]}`);
        }
    }

    addEventListener(event, listener){
        if(!Object.keys(this.events).includes(event)){
            throw `FilterPicker does not have event '${event}'`;
        } else {
            this.events[event].push(listener);
        }
    }

}

export default FilterPicker;