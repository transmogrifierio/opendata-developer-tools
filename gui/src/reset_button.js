const { QWidget, QPushButton, QGridLayout } = require('@nodegui/nodegui');

class ResetButton extends QWidget{
    constructor() {
        super();
        this.setLayout(new QGridLayout());
        this.b = new QPushButton();
        this.b.setText("Reset");
        this.b.setFixedSize(160,60);
        this.b.setInlineStyle(`
        font: 22px;
`       );
        this.layout.addWidget(this.b,0,0);
    }

    resetAll(widgetList){
        widgetList.forEach((item)=>{ item.reset() });
    }

}

export default ResetButton;