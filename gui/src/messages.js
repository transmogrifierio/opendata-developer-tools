import {
    QWidget,
    QGridLayout,
    QTreeWidget,
    QTreeWidgetItem
} from "@nodegui/nodegui";

class CustomMessage extends QWidget{

    constructor() {
        super();
        this.root = new QGridLayout();
        this.setLayout(this.root);
        this.container = new QTreeWidget();
        this.warningArea = new QTreeWidgetItem();
        this.errorArea = new QTreeWidgetItem();
        this.container.addTopLevelItem(this.warningArea);
        this.container.addTopLevelItem(this.errorArea);
        this.container.setHeaderLabel("Messages");
        this.root.addWidget(this.container);
    }

    /*
        Displays messages in the warning area and error area
        Counts how many errors and warnings are found
     */
    displayMessages(data) {
        let w = 0;
        let e = 0;
        data.messages.forEach((message) => {
            if (message.level === "Warning") {
                w++;
                const warn = new QTreeWidgetItem();
                warn.setText(0, message.message);
                const temp = new QTreeWidgetItem();
                temp.setText(0, message.path);
                warn.addChild(temp);
                this.warningArea.addChild(warn);
            } else {
                e++;
                const err = new QTreeWidgetItem();
                err.setText(0, message.message);
                const temp = new QTreeWidgetItem();
                temp.setText(0, message.path);
                err.addChild(temp);
                this.errorArea.addChild(err);
            }
        });
        if (w === 0) {
            this.warningArea.setText(0,'No Warnings');
        }
        else {
            this.warningArea.setText(0, w + ' Warning(s)');
        }
        if (e === 0) {
            this.errorArea.setText(0,'No Errors');
        }
        else {
            this.errorArea.setText(0,e + ' Error(s)');
        }
    }
}

export default CustomMessage;