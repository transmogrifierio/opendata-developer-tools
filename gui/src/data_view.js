import {
    QGridLayout, QTextBrowser, QWidget
} from "@nodegui/nodegui";

class Data_view extends QWidget {
    constructor() {
        super();
        this.root = new QGridLayout();
        this.setLayout(this.root);
        this.dataArea = new QTextBrowser();

        this.root.addWidget(this.dataArea, 0, 0);
    }

    displayData(data) {
        this.dataArea.append(data);
    }
}

export default Data_view;