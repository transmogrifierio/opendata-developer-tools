# ODEN
OdenGui is an open source, cross platform tool for developers that work with ODEN and opendata. 
The tool allows developers to thoroughly test the filters they create and ensure they work correctly 
and if not, identify where they went wrong.

## Getting Started
- Download or clone the files locally.
- In the Opendata-dev-tools directory run ```$npm install```.
- In the gui directory run ```$npm start``` to launch the app.
- Fill in the appropriate sections with your inputs and use the verify button to view your results.
- See the below **UI Components** for further information.

## How Does It Work
On the main window of the GUI you can select your **schema**, **dataset** and **filter** to test. Once you have 
selected the inputs, simply hit the verify button and another window will display the input data,
output data and any warnings or errors that have been generated along with the path to the error.

**Optionally** you can run the program using additional command line arguments with 
- [ 'c', 'clear-cache',         'delete the .files directory'],
- [ 'f', 'force-download=ARG+', 'do not check timestamp for files [all,data,filters,schemas,validators]'],
- [ 'p', 'print',               'print the result'],
- [ 'd', 'database=ARG',        'database file'],
- [ '',  'locality=ARG',        'the locality in the database'],
- [ '',  'type=ARG',            'the type'],
- [ '',  'from=ARG',            'from format'],
- [ '',  'to=ARG',              'to format'],
- [ '',  'lang=ARG',            'language'],
- [ '',  'source=ARG',          'source URL'],
- [ '',  'filter=ARG',          'filter URL'],
- [ '' , 'schema=ARG',          'schema URL'],
- [ '',  'help',                'help']

```
Eg. $npm start -- --help
Eg. $npm start -- --locality [location] --type [schema] --from [original format] --to [filter format] --lang [language] -f all
```

## UI Components  
OdenGui is separated into two windows and several components. These components are outlined below.

### Input Window
The Input Window contains all components associated with selecting a dataset and a filter to run on that dataset.

#### Schema Picker  
The Schema Picker is located in the top left of the input window, and lists all schemas defined in 
the database. Clicking an entry in this list will select that schema and display all localities that have datasets for
it to the right in the Locale Picker.  

At the top of the Schema Picker, the search bar allows you to enter a search string to look for a specific
schema. Pressing the back button to the left of the search bar will return you to a list of all schemas.

#### Locale Picker  
The Schema Picker is located in the top left of the input window, and lists all countries defined in the
database as two letter country codes. Clicking on one of these codes will select that location, and pull up a list
all locations define within the selected location. Any datasets found for that location will be displayed in the
Schema Picker to the left.

#### Filter Picker  
The Filter picker is located in the center of the input window, and displays the available filters for the currently
selected dataset. Once you have selected a locale and schema, you will be able to select an input type in the top
dropdown menu. Once you have selected an input type, you will be able to view and select and output type and language
for the filter you wish to select. If there is only one filter for the dataset you have selected, the filter will be
automatically selected.

#### URL Fields  
The URL fields are located below the Filter Picker, and include the Schema URL, Filter URL, and Source URL. These
fields are automatically populated as you make selections in the Schema, Locale, and Filter pickers. Editing these
fields with custom values will open the option to override the fields, as shown by the checkmark to the left of the
text box. Selecting override will cause the program to ignore that value in the database and use the provided value
instead.

#### Command Line Arguments Field  
The Command Line Arguments field is located above the verify and reset buttons, and is automatically populated as
you make selections in the components listed above. Clicking on the button to the right of the text box will copy
the arguments to your clipboard, allowing you to launch the program again with your saved settings.

#### Verify Button  
The Verify Button is located in the bottom right of the input window. Once you have selected a Locale, Schema, and
Filter, you can click this button to run the filter and validate the output. This will open the Validation window. 

#### Reset Button  
The Verify Button is located in the bottom right of the input window. Clicking this button will clear all selections
you have made and return the input window to it's default state.

### Validation Window  

#### Input File
The text-box in the top left of the window displays the original input data file as a JSON.
#### Output File
The text-box in the top right of the window displays the filtered output data as a JSON.
#### Message Box
The message box will hold any messages generated during the filter. The messages are divided into warnings and errors and the number is tracked separately. Each warning and error can be clicked to reveal the json path to the location of the warning or error.  


## Contributers 
- **D'Arcy Smith**
- **Brian White**
- **Devin Spray-Wiegert**
- **Evano Hirabe**
- **Hannah Nguyen**
- **Louis Lu**



