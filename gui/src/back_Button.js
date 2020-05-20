const oden_index = require('./oden_index.js');

import backIcon from '../assets/arrow-left-11.png';

import {
    QWidget, QPushButton, QIcon, QGridLayout, QSize, QLabel
} from '@nodegui/nodegui';

class BackButton extends QWidget{
    /**
     * Back Button class reset the Schema Picker
     * @param index
     * @param locationPicker
     */
    constructor(index, locationPicker) {
        super();
        this.locationPicker = locationPicker;
        this.setLayout(new QGridLayout());
        this.backButton = new QPushButton();
        this.backButton.setIcon(new QIcon(backIcon));
        this.backButton.setIconSize(new QSize(20,20));
        this.backButton.setObjectName("backBtn");
        this.backButton.setFixedSize(40,40);
        this.editText = new QLabel();
        this.layout.addWidget(this.backButton,0,0);
        this.layout.addWidget(this.editText,0,1);
        this.setStyleSheet(`
            #backBtn{
                background-color: #E9E8E6 ;
            }
        `);
    }
}

export default BackButton;