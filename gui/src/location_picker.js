import BackButton from "./back_Button";
import {QWidget, QPushButton, WidgetEventTypes, WidgetAttribute, QScrollArea, ScrollBarPolicy, QBoxLayout, QGridLayout} from '@nodegui/nodegui';
const oden_index = require('./oden_index.js');

class LocationPicker extends QWidget{
    constructor(index) {
        super();
        this.setLayout(new QGridLayout());
        this.area = new QScrollArea();
        this.area.setVerticalScrollBarPolicy(ScrollBarPolicy.ScrollBarAsNeeded);
        this.area.setWidgetResizable(true);
        this.container = new QWidget();
        this.container.setLayout(new QBoxLayout(2));
        this.container.setObjectName("contentContainer");

        this.area.setWidget(this.container);
        this.area.setObjectName('scrollArea');
        this.backButton = new BackButton(index, this);

        this.backButton.backButton.addEventListener('clicked', ()=>{this.backButtonClick()});
        this.layout.addWidget(this.backButton,0,0);
        this.layout.addWidget(this.area,1,0);

        this.index = index;

        //List of custom events this widget will throw
        this.events = {
            "locationClick":[], //Expects event listeners to take parameter (location)
            "locationBack":[] //Expects event listeners to take no parameters
        };


        this.locations = [];
        this.current = null;
        this.setLocations(this.index.getRootLocations());
    }


    /**
     * Populates the widget with a list of locations
     * @param {Location|[]} locations list of
     */
    setLocations(locations){
        this.clearLocations();
        for(let i = 0; i < locations.length; i++)  { this.addLocation(locations[i]); }
        this.container.repaint();
    }

    /**
     * Clears the widget of all listed locations
     */
    clearLocations(){
        for(let i = this.locations.length - 1; i >= 0; i--){
            this.locations[i].close();
        }
        this.locations = [];
    }

    /**
     * Adds a single location entry to the widget's list of locations
     * @param location Location to add to list
     */
    addLocation(location){
        let label = new QPushButton();
        label.setObjectName("labelBtn");
        label.setAttribute(WidgetAttribute.WA_DeleteOnClose, true);
        label.setText(location.getFullName());
        label.addEventListener(WidgetEventTypes.MouseButtonPress, () => { this.locationClick(location) });
        this.container.layout.addWidget(label);
        this.locations.push(label);
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
            throw `LocationPicker does not have event '${event}'`;
        } else {
            this.events[event].push(listener);
        }
    }

    /**
     * Fired when location is clicked in the UI. Runs all 'locationClick' event handlers and displays
     * all of a location's children, if any.
     * @param location Location that was clicked
     */
    locationClick(location){
        this.current = location;
        this.events["locationClick"].forEach((e) => { e(location) });
        let children = this.index.getLocationChildren(location);
        if(children.length > 0){
            this.setLocations(children);
        } else {
            this.setLocations([location]);
        }
    }

    /**
     * Fired when the back button is clicked. Runs all 'locationBack' event handlers
     * and moves one level up in the parent hierarchy
     */
    backButtonClick(){
        if(this.current){
            this.current = this.index.getLocationParent(this.current);
            if(this.current){
                let children = this.index.getLocationChildren(this.current);
                this.setLocations(children);
            } else {
                this.setLocations(this.index.getRootLocations());
            }

        } else {
            this.setLocations(this.index.getRootLocations());
        }
        this.events["locationBack"].forEach((e) => { e() });
    }

    /**
     * Returns the widget to it's default state
     */
    reset(){
        this.current = null;
        this.setLocations(this.index.getRootLocations());
    }

    /**
     * Loads the location passsed to the widget from the command line arguments
     * @param arg String list of command line arguments
     */
    loadCmdArgument(arg){
        let loc = this.index.getLocationFromArgument(arg[0]);
        this.locationClick(loc);
    }
 }

export default LocationPicker;