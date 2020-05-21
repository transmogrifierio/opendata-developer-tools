import {QGridLayout, QMainWindow, QWidget, QLabel} from '@nodegui/nodegui';

import CustomMessage from "./messages.js";
import Data_view from "./data_view.js";

class Data_window extends QMainWindow {

    constructor() {
        super();
        const dataCentralWidget = new QWidget();
        dataCentralWidget.setObjectName("myroot");
        const dataRootLayout = new QGridLayout();
        dataRootLayout.setObjectName("mylayout");
        dataCentralWidget.setLayout(dataRootLayout);
        this.setWindowTitle("Validation");

        this.dataMessages = new CustomMessage();
        this.dataMessages.resize(50, 50);
        this.inputView = new Data_view();
        this.outputView = new Data_view();
        this.inputLabel = new QLabel();
        this.outputLabel = new QLabel();

        this.inputLabel.setText("Input File");
        this.outputLabel.setText("Output File");

        dataRootLayout.addWidget(this.dataMessages, 2, 0, 2, 2);
        dataRootLayout.addWidget(this.inputLabel, 0, 0, 1, 1);
        dataRootLayout.addWidget(this.outputLabel, 0, 1, 1, 1);
        dataRootLayout.addWidget(this.inputView, 1, 0, 1, 1);
        dataRootLayout.addWidget(this.outputView, 1, 1, 1, 1);
        this.setCentralWidget(dataCentralWidget);
        this.resize(800,800);
        this.setInlineStyle('background-color: #92CC6F');
    }

    DisplayMessages(data) {
        this.dataMessages.displayMessages(data);

        this.inputView.displayData(JSON.stringify(data.source, null, 4));
        this.outputView.displayData(JSON.stringify(data.filtered, null ,4));
    }
}

export default Data_window;
