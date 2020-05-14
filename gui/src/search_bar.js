import {
    QGridLayout, QIcon, QLabel,
    QPushButton,
    QTextEdit,
    QWidget,
    QSize,
    WidgetAttribute,
    WidgetEventTypes
} from "@nodegui/nodegui";
import backIcon from '../assets/arrow-left-11.png';
import searchIcon from '../assets/searchIcon1.png';

const AccurateSearch = require('accurate-search');
const oden_index = require('./oden_index.js');

class SearchBar extends QWidget{
    constructor(index,schemaPicker) {
        super();
        this.index = index;
        this.schemaPicker = schemaPicker;
        this.setLayout(new QGridLayout());

        this.events = {
            "search":[]
        }

        this.homeButton = new QPushButton();
        //this.homeButton.setText("<");
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
        //this.searhButton.setText(">");
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

    addEventListener(event, listener){
        if(!Object.keys(this.events).includes(event)){
            throw `SearchBar does not have event '${event}'`;
        } else {
            console.log("Added event listener for ", event);
            this.events[event].push(listener);
        }
    }

    getAccurateSearch(options){
        let accurateSearch = new AccurateSearch();
        for (let i = 0; i < options.length; i++) {
            accurateSearch.addText(i, options[i])
        }
        console.log(accurateSearch);
        return accurateSearch;
    }

    search(){
        console.log("search is called");
        let options = Object.keys(this.index.getSchemas());
        let accurateSearch = this.getAccurateSearch(options);
        let searchString = this.searchBar.toPlainText();
        console.log("search string: ", searchString);
        let foundIds = accurateSearch.search(searchString);

        let results = [];
        for(let id of foundIds){
            results.push(options[id]);
        }
        console.log("results: ", results);
        this.events["search"].forEach((e) => { e(results) });

    }
}

export default SearchBar;