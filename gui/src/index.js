import InputWindow from "./input_window";

if (process.argv.length == 2){
    new InputWindow(null);
} else if (process.argv.length == 7){
    new InputWindow(process.argv.slice(2, 7));
} else{
        const error_msg = "missing arguments... please input as fallow:\n" +
            "$npm start [location] [schema] [original format] [filter format] [language] \n"
        console.error("Error: ", error_msg);
        process.exit();
}

class data{
    constructor() {
        this.messages = []
    }
}
const d = new data()
class message {
    constructor(level, mess) {
        this.level = level
        this.message = mess
    }
}
var i;
for (i = 0; i < 100; i++) {
    d.messages[i] = new message("Warning", "Hi, I am a warning");
}
d.messages[100] = new message("Error", "Uh Oh I am an Error");

class Transformer {
    transform(message) {
        return message.toLowerCase();
    }
}
