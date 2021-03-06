/////////////////// config airtable

// keys
var airtableApiKey = location.hash.substring(1); //add the apiKey at the end of the url (..index.html#apiKey)
var airtableBaseKey = "apptalZ4kFQ7sTore";

// base
var airtableBaseName = "timetable2";

// view
var airtableViewName = "Grid view";

// records
var toDo;
var toDos = [];
var secondsToEndToDo;
var secondsToEndToDos = [];
var color;
var colors = [];
var bgColor;
var bgColors = [];
var aRecord6;
var aRecord6Arr = [];

// retrieving data from airtable
var Airtable = require('airtable');
var base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseKey);

base(airtableBaseName).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function (record) {
        toDo = record.get("action");
        toDos.push(toDo);
        secondsToEndToDo = record.get("secs in total end");
        secondsToEndToDos.push(secondsToEndToDo);
        color = record.get("color");
        colors.push(color);
        bgColor = record.get("background color");
        bgColors.push(bgColor);
        aRecord6 = record.get("mins highlighted");
        aRecord6Arr.push(aRecord6);
    });

}, function done(err) {
    if (err) { console.error(err); return; }
});

// error message
if (airtableApiKey == "") {
    headerElem.textContent = "ERROR";
    footerElem.textContent = "AIRTABLE_API_KEY is missing (..index.html#apiKey)";
}

/////////////////// variables

// countdown
var headerElem = document.getElementById("header");
var countdownElem = document.getElementById("countdown");
var footerElem = document.getElementById("footer");

// other
var highlightedColor = "#fff";
var highlightedBackgroundColor = "#f00";

var hours;
var minutes;
var seconds;

// modes
var lastMinuteMode = true;

/////////////////// logic

// refresh rate
setInterval(update, 1000);

function update() {
    displayCountdown(calculateCountdown());
}

function calculateCountdown() {
    // get date and time
    var now = new Date();

    var HH = now.getHours();
    var MM = now.getMinutes();
    var SS = now.getSeconds();

    // calculate time in seconds
    var secondsNow = (HH * 3600) + (MM * 60) + parseInt(SS);
    var secondsDay = 24 * 3600;

    // calculation of the total amount of seconds till the end of the matching record
    // (assuming that secondsToEndToDo is sorted ascendingly)
    var secondsToEndToDoNow;
    // if the present moment is bigger than the last record
    if (secondsNow > secondsToEndToDos[secondsToEndToDos.length - 1]) {
        // it means that we are in the first record
        var i = 0;
        // then, calculate the total amount of seconds taking into account the remaining time from the last record
        secondsToEndToDoNow = (secondsDay - secondsNow) + secondsToEndToDos[i];
    } else {
        // search for the record according to the present moment
        for (var j = 0; j < secondsToEndToDos.length; j++) {
            if (secondsNow <= secondsToEndToDos[j]) {
                i = j;
                break;
            }
        }
        // calculate the total amount of seconds remaining till the end of the record
        secondsToEndToDoNow = secondsToEndToDos[i] - secondsNow;
    }

    // the calculation that is finally rendered makes more sense if we add 60 seconds
    // for example, next change is at 12:00, now we are at 11:55 and time left is 4 minutes and some seconds
    // if we don't see the seconds the calculation makes more sense if it is 5 minutes left instead of 4
    secondsToEndToDoNow = secondsToEndToDoNow + 60;

    // calculate countdown
    hours = parseInt(secondsToEndToDoNow / 3600);
    minutes = parseInt((secondsToEndToDoNow % 3600) / 60);
    seconds = (secondsToEndToDoNow % 3600) % 60;

    return i;

}

function displayCountdown(i) {
    headerElem.textContent = toDos[i];
    var minsHighlighted = aRecord6Arr[i];

    if (hours == 0) {
        // check if lastMinuteMode is ON
        if (minutes == 1 && lastMinuteMode) {
            // +1 is for counting from 60 to 1 instead of from 59 to 0
            countdownElem.textContent = seconds + 1;
        } else {
            countdownElem.textContent = minutes;
        }
        if ((minutes) <= minsHighlighted) {
            changeColors(highlightedColor, highlightedBackgroundColor);
        } else {
            changeColors(colors[i], bgColors[i]);
        }
    } else {
        changeColors(colors[i], bgColors[i]);
        countdownElem.textContent = hours + ":" + twoDigits(minutes);
    }

    if (i < toDos.length - 1) {
        footerElem.textContent = toDos[i + 1];
    } else {
        footerElem.textContent = toDos[0];
    }
}

// check format countdown
function twoDigits(n) {
    if (n < 10) { return "0" + n; } else { return n; }
}

// change the color for the text and for the background
function changeColors(c, b) {
    document.body.style.color = c;
    document.body.style.background = b;
}