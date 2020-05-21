import {
    QGridLayout, QIcon, QPushButton, QTextEdit, QWidget, QSize, WidgetEventTypes
} from "@nodegui/nodegui";

import backIcon from '../assets/arrow-left-11.png';
import searchIcon from '../assets/searchIcon1.png';

const AccurateSearch = require('accurate-search');

class SearchBar extends QWidget{
    constructor(index,schemaPicker) {
        super();
        this.index = index;
        this.schemaPicker = schemaPicker;
        this.setLayout(new QGridLayout());

        // List of custom events this widget will throw
        this.events = {
            "search":[] // Expects event listeners to take a single string array parameter (results)
        }

        this.homeButton = new QPushButton();
        this.homeButton.setIcon(new QIcon(backIcon));
        this.homeButton.setObjectName("homeBtn");
        this.homeButton.setIconSize(new QSize(20,20));

        this.homeButton.setFixedSize(40,40);
        this.homeButton.addEventListener("clicked", ()=>{
            this.schemaPicker.showAllSchemas();

        });
        this.layout.addWidget(this.homeButton,0,0);


        this.searchBar = new QTextEdit();
        this.searchBar.setMaximumSize(2000,40);
        this.searchBar.setPlaceholderText("Search");
        this.searchBar.addEventListener(WidgetEventTypes.KeyPress,()=>{this.search()});
        this.layout.addWidget(this.searchBar, 0, 1);

        this.searhButton = new QPushButton();
        this.searhButton.addEventListener(WidgetEventTypes.MouseButtonPress, ()=> {
            this.search()
        });

        this.searhButton.setIcon(new QIcon(searchIcon));
        this.searhButton.setIconSize(new QSize(35,35));
        this.searhButton.setFixedSize(40,40);
        this.layout.addWidget(this.searhButton, 0, 3);

        this.setStyleSheet(`
            #homeBtn{
                background-color: #E9E8E6 ;
            }
        `);
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
            throw `SearchBar does not have event '${event}'`;
        } else {
            this.events[event].push(listener);
        }
    }

    /**
     * Constructs the accurate search object from all options provided
     * Typically, this would be all schema names
     * @param options String array of options
     * @returns {AccurateSearch} Object that
     */
    getAccurateSearch(options){
        let accurateSearch = new AccurateSearch();
        for (let i = 0; i < options.length; i++) {
            accurateSearch.addText(i, options[i])
        }
        return accurateSearch;
    }

    /**
     * Performs a search based on the string in the searchbar
     * Runs all 'search' event handlers with the results
     */
    search(){
        let options = Object.keys(this.index.getSchemas());
        let accurateSearch = this.getAccurateSearch(options);
        let searchString = this.searchBar.toPlainText();
        let foundIds = accurateSearch.search(searchString);

        let results = [];
        for(let id of foundIds){
            results.push(options[id]);
        }
        this.events["search"].forEach((e) => { e(results) });
    }
}

export default SearchBar;