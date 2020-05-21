const oden_index = require('./oden_index.js');
import {
    QWidget, QPushButton, QGridLayout, WidgetEventTypes, WidgetAttribute, ScrollBarPolicy, QScrollArea, QBoxLayout
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
        this.layout.addWidget(this.area,1,0);

        this.index = index;

        //Event listening
        this.events = {
            "schemaClick":[], //Expects event listeners to take no parameters
            "schemaSearch":[] //Expects event listeners to take 2 string parameters: (schema name, url)
        };

        this.allSchemas = this.index.getSchemas();
        this.schemas = [];
        this.current = null;
        this.showAllSchemas();
    }

    /**
     * Displays all available schemas defined in database.json
     */
    showAllSchemas(){
        this.setSchemas(Object.keys(this.allSchemas));
    }

    /**
     * Sets the list of schemas to display
     * @param schemaList String list of schema names
     */
    setSchemas(schemaList){
        this.clearSchemas();
        for(let i = 0; i < schemaList.length; i++)  { this.addSchema(schemaList[i]); }
    }

    /**
     * Sets the dataset object of this widget, which determines what schemas are displayed
     * @param datasets
     */
    setDatasets(datasets){
        let schemaList = [];
        datasets.forEach((item) => { schemaList.push(item.schemaName) });
        this.setSchemas(schemaList);
    }

    /**
     * Clears all displayed schemas
     */
    clearSchemas(){
        for(let i = this.schemas.length - 1; i >= 0; i--){
            //unsure whether to close or delete, so I will do both
            this.schemas[i].close();
        }
        this.schemas = [];
    }

    /**
     * Adds a single schema entry to the widget's list of schemas
     * @param schemaName String name of the schema to add
     */
    addSchema(schemaName){
        let label = new QPushButton();
        label.setObjectName("label");
        label.setAttribute(WidgetAttribute.WA_DeleteOnClose, true);
        label.setText(schemaName);
        label.addEventListener(WidgetEventTypes.MouseButtonPress, () => { this.schemaClick(schemaName) });
            this.container.layout.addWidget(label);

        this.schemas.push(label);
    }

    /**
     * Adds a custom event listener for the widget. Look at this.events for more
     * info on what custom events were added
     * Overrides QWidget.addEventListener
     * @param event String to identify the event the function will subscribe to
     * @param listener Function to execute when event occurs
     */
    addEventListener(event, listener){
        if(!Object.keys(this.events).includes(event)){
            throw `SchemaPicker does not have event '${event}'`;
        } else {
            this.events[event].push(listener);
        }
    }

    /**
     * Fired when schema is clicked in the UI. Selects the current schema,
     * and Runs all 'schemaClick' event handlers
     * @param schema
     */
    schemaClick(schema){
        console.log("Schema click,", schema);
        this.current = schema;
        //Parameters passed = schema name, url
        this.events["schemaClick"].forEach((e) => { e(schema, this.allSchemas[schema]) });
    }

    /**
     * Resets the widget back to it's default state
     */
    reset(){
        this.showAllSchemas();
        this.current = null;
    }

    /**
     * Loads the location passsed to the widget from the command line arguments
     * @param arg String list of command line arguments
     */
    loadCmdArgument(arg){
        this.schemaClick(arg[1]);
    }
}

export default SchemaPicker;