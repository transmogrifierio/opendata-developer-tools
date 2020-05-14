import {QWidget, QTextEdit, QGridLayout, QLabel, QCheckBox, WidgetEventTypes} from "@nodegui/nodegui";

class FilterURLInput extends QWidget {
    constructor() {
        super();
        this.setLayout(new QGridLayout());
        this.f = new QLabel();
        this.f.setText("Filter URL: ")
        this.f.setFixedSize(200, 40);
        this.e = new QTextEdit();
        this.e.setObjectName("filter")
        this.e.setMaximumSize(2000, 40);
        this.e.setObjectName("filter url");
        this.c = new QCheckBox();
        this.c.setText("Override");
        this.layout.addWidget(this.f, 0, 0);
        this.layout.addWidget(this.e, 0, 1);
        this.EventHandler();
    }

    getFilterURL() {
        this.e.toPlainText();
    }

    setFilterUrl(text) {
        this.e.setText(text);
    }

    ResetInput() {
        this.e.clear();
    }

    ResetCheckBox() {
        this.c.hide();
    }

    loadCmdArgument(cmdArgments) {
        let result = "https://raw.githubusercontent.com/transmogrifierio/opendata-schemas/master/"
        let updateLocationName = cmdArgments[0].replace(" ", "%20");
        result += updateLocationName +"/" +cmdArgments[1].replace(" ", "-")+ "JSON-to-JSON"+".js"
        this.e.setText(result)
    }

    EventHandler() {
        this.e.addEventListener(WidgetEventTypes.KeyPress, () => {
            this.layout.addWidget(this.c, 0, 2);
        });

    }
}

export default FilterURLInput;