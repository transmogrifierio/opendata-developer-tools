const oden_index = require('./oden_index.js');
import backIcon from '../assets/arrow-left-11.png';
import {
    QWidget,
    QPushButton,
    FlexLayout,
    WidgetEventTypes,
    WidgetAttribute,
    QScrollArea,
    QIcon,
    ScrollBarPolicy, QBoxLayout, QGridLayout, QSize
} from '@nodegui/nodegui';

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
        this.backButton = new QPushButton();
        this.backButton.setIcon(new QIcon(backIcon));
        this.backButton.setIconSize(new QSize(20,20));
        this.backButton.setObjectName("backBtn");
        this.backButton.setFixedSize(40,40);
       // this.backButton.setText('<');
        this.backButton.addEventListener('clicked', ()=>{this.backButtonClick()});
        this.layout.addWidget(this.backButton,0,0);
        this.layout.addWidget(this.area,1,0,1,1);

        //oden_index.OdenOIndexJson
        this.index = index;
        //Event listening
        this.events = {
            "locationClick":[],
            "locationBack":[]
        };


        this.locations = [];
        this.current = null;
        this.setLocations(this.index.getRootLocations());

        this.setStyleSheet(`
            #backBtn{
                background-color: #E9E8E6 ;
            }
        `);
    }

    setLocations(locations){
        console.log("Setting location");
        this.clearLocations();
        for(let i = 0; i < locations.length; i++)  { this.addLocation(locations[i]); }
        this.container.repaint();
        console.log("Location set");
    }

    clearLocations(){
        for(let i = this.locations.length - 1; i >= 0; i--){
            //unsure whether to close or delete, so I will do both
            this.locations[i].close();
            //delete this.locations[i];
        }
        this.locations = [];
    }

    addLocation(location){
        let label = new QPushButton();
        label.setObjectName("labelBtn");
        label.setAttribute(WidgetAttribute.WA_DeleteOnClose, true);
        label.setText(location.getFullName());
        label.addEventListener(WidgetEventTypes.MouseButtonPress, () => { this.locationClick(location) });
        this.container.layout.addWidget(label);
        this.locations.push(label);
    }

    addEventListener(event, listener){
        if(!Object.keys(this.events).includes(event)){
            throw `LocationPicker does not have event '${event}'`;
        } else {
            this.events[event].push(listener);
        }
    }

    locationClick(location){
        console.log("Location click,", location.name);
        this.current = location;
        this.events["locationClick"].forEach((e) => { e(location) });
        let children = this.index.getLocationChildren(location);
        if(children.length > 0){
            this.setLocations(children);
        } else {
            this.setLocations([location]);
        }
    }

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

    reset(){
        this.current = null;
        this.setLocations(this.index.getRootLocations());
    }

    loadCmdArgument(arg){
        let loc = this.index.getLocationFromArgument(arg[0]);
        this.locationClick(loc);
    }
}

export default LocationPicker;