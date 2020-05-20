import {
    QWidget, QTextEdit, QGridLayout, QLabel, QPushButton, QIcon, WidgetEventTypes, QSize
} from "@nodegui/nodegui";

import copyIcon from '../assets/copyIcon.png';

class ArgumentBox extends QWidget {
    constructor() {
        super();
        this.setLayout(new QGridLayout());
        this.f = new QLabel();
        this.f.setFixedSize(200,40);
        this.f.setText("Command Line Arguments: ");
        this.f.setObjectName("argumentsLabel");

        this.e = new QTextEdit();
        this.e.setMaximumSize(2000,40);
        this.e.setObjectName("arguments");

        this.b = new QPushButton();
        //this.b.setText("COPY");
        this.b.setIcon(new QIcon(copyIcon));
        this.b.setIconSize(new QSize(30,30));
        this.b.setFixedSize(40,40);
        this.b.addEventListener(WidgetEventTypes.MouseButtonPress, () => { this.e.selectAll(); this.e.copy(); });

        this.layout.addWidget(this.f, 0, 0);
        this.layout.addWidget(this.e, 0, 1);
        this.layout.addWidget(this.b, 0, 2);
    }

    getArguments() {
        this.e.toPlainText();
    }

    updateArguments(input){
        let args = "npm start ";
        if(input.location != null){
            args += "--locality \"" + input.location.getFullName() + "\" ";
        }
        if(input.dataset != null){
            args += "--type \"" + input.dataset.schemaName + "\" ";
        }
        if(input.filter != null){
            args += `--from ${input.filter.inputType} --to ${input.filter.outputType} --lang ${input.filter.language}`
        }
        this.e.setText(args);
    }
    loadCmdArgument(cmdArguments){
        let result = "\"" + cmdArguments[0] + "\"" + " " + "\"" + cmdArguments[1]
            + "\"" + " " + cmdArguments[2] + " " + cmdArguments[3] + " " + cmdArguments[4]
        this.e.setText(result)
    }
}

export default ArgumentBox;