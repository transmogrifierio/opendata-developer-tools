
import {QWidget, QTextEdit, QGridLayout, QLabel, QCheckBox, WidgetEventTypes} from "@nodegui/nodegui";

class SourceURLInput extends QWidget{
    constructor() {
        super();
        this.setLayout(new QGridLayout());
        this.l = new QLabel();
        this.l.setText("Source URL: ");
        this.l.setFixedSize(200,40);
        this.e = new QTextEdit();
        this.e.setObjectName("schema url");
        this.e.setMaximumSize(2000, 40);
        this.c = new QCheckBox();
        this.c.setText("Override");
        this.layout.addWidget(this.l, 0, 0)
        this.layout.addWidget(this.e, 0, 1);

        this.EventHandler();
    }
    getSourceURL(){
        this.e.toPlainText();
    }
    setSourceURL(text){
        this.e.setText(text);
    }
    ResetInput(){
        this.e.clear();
    }
    ResetCheckBox(){
        this.c.hide();
    }
    EventHandler(){
        this.e.addEventListener(WidgetEventTypes.KeyPress, () => {
            this.layout.addWidget(this.c, 0, 2);
        });
    }
}

export default SourceURLInput;