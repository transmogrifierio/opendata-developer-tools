const oden_index = require('./oden_index.js');
import {
    QWidget,
    QLabel,
    QPushButton,
    QGridLayout,
    FlexLayout,
    WidgetEventTypes,
    WidgetAttribute, QScrollBar, ScrollBarPolicy, QScrollArea, QBoxLayout
} from '@nodegui/nodegui';

import SearchBar from "./search_bar";

class SchemaPicker extends QWidget{
    constructor(index) {
        super();

        this.setLayout(new QGridLayout());
        this.area = new QScrollArea();

        this.area.setVerticalScrollBarPolicy(ScrollBarPolicy.ScrollBarAsNeeded);
        this.area.setWidgetResizable(true);
        this.container = new QWidget();
        this.container.setLayout(new QBoxLayout(2));
        this.container.setObjectName("contentContainer");


        this.searchBar= new SearchBar(index,this);
        this.searchBar.addEventListener("search", (list)=>{
            this.setSchemas(list);
            this.events["schemaSearch"].forEach((e) => { e() });
        });
        this.area.setWidget(this.container);
        this.area.setObjectName('scrollArea');
        this.layout.addWidget(this.searchBar,0,0);
        this.layout.addWidget(this.area,1,0,1,1);

        //oden_index.OdenOIndexJson
        this.index = index;

        //Event listening
        this.events = {
            "schemaClick":[],
            "schemaSearch":[]
        };

        this.allSchemas = this.index.getSchemas();
        this.schemas = [];
        this.current = null;
        this.showAllSchemas();
    }

    showAllSchemas(){
        this.setSchemas(Object.keys(this.allSchemas));
    }

    setSchemas(schemaList){
        this.clearSchemas();
        for(let i = 0; i < schemaList.length; i++)  { this.addSchema(schemaList[i]); }
    }

    setDatasets(datasets){
        let schemaList = [];
        datasets.forEach((item) => { schemaList.push(item.schemaName) });
        this.setSchemas(schemaList);
    }

    clearSchemas(){
        for(let i = this.schemas.length - 1; i >= 0; i--){
            //unsure whether to close or delete, so I will do both
            this.schemas[i].close();
        }
        this.schemas = [];
    }

    addSchema(schemaName){
        let label = new QPushButton();
        label.setObjectName("label");
        label.setAttribute(WidgetAttribute.WA_DeleteOnClose, true);
        label.setText(schemaName);
        label.addEventListener(WidgetEventTypes.MouseButtonPress, () => { this.schemaClick(schemaName) });
            this.container.layout.addWidget(label);

        this.schemas.push(label);
    }
    addEventListener(event, listener){
        if(!Object.keys(this.events).includes(event)){
            throw `SchemaPicker does not have event '${event}'`;
        } else {
            console.log("Added event listener for ", event);
            this.events[event].push(listener);
        }
    }

    schemaClick(schema){
        console.log("Schema click,", schema);
        this.current = schema;
        //Parameters passed = schema name, url
        this.events["schemaClick"].forEach((e) => { e(schema, this.allSchemas[schema]) });

    }

    reset(){
        this.showAllSchemas();
        this.current = null;
    }

    loadCmdArgument(arg){
        this.schemaClick(arg[1]);
    }
}

export default SchemaPicker;