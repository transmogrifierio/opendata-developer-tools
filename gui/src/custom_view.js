import {QGridLayout, QTextBrowser, QWidget} from "@nodegui/nodegui";

class CustomView extends QWidget {
    constructor() {
        super();
        this.root = new QGridLayout();
        this.setLayout(this.root);
        this.dataArea = new QTextBrowser();
        this.root.addWidget(this.dataArea, 0, 0);
    }
}

export default CustomView;