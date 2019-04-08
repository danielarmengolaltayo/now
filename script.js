/////////////////// config airtable

// keys
var airtableApiKey = location.hash.substring(1); //add the apiKey at the end of the url (..index.html#apiKey)
var airtableBaseKey = "appJiXZgUVkUbDbhY";
console.log(airtableApiKey);

// base
var airtableBaseName = "timetable2";

// view
var airtableViewName = "Grid view";

// records
var airtableRecord1Name = "action";
var airtableRecord1;
var airtableRecord1Array = [];
var airtableRecord2Name = "secs in total end";
var airtableRecord2;
var airtableRecord2Array = [];
var airtableRecord3Name = "schedule";
var airtableRecord3;
var airtableRecord3Array = [];
var airtableRecord4Name = "color";
var airtableRecord4;
var airtableRecord4Array = [];
var airtableRecord5Name = "background color";
var airtableRecord5;
var airtableRecord5Array = [];
var airtableRecord6Name = "mins highlighted";
var airtableRecord6;
var airtableRecord6Array = [];

/////////////////// variables

// countdown
var record1 = document.getElementById("header");
var countdownElem = document.getElementById("countdown");
var footerElem = document.getElementById("footer");
var footerLElem = document.getElementById("footerL");
var footerRElem = document.getElementById("footerR");

// other
var next;
var record4 = document.getElementById("timetable");
var timetableLoaded = false;
var highlightedColor = "#fff";
var highlightedBackgroundColor = "#f00";

var beep = new Audio("beep.wav");

// modes
var devMode = false;
var roundUpMins = true;

///////////////////

// refresh rate
setInterval(update, 1000);

///////////////////

function update(){

    // get date and time
    var now = new Date();
    
    var yy = now.getFullYear() - 2000;
    var mm = now.getMonth() + 1; //January is 0!
    var dd = now.getDate();

    var HH = now.getHours();
    var MM = now.getMinutes();
    var SS = now.getSeconds();

    // calculate time in seconds
    var totalSecondsNow = (HH * 3600) + (MM * 60) + parseInt(SS);
    var totalSecondsDay = 24 * 3600;

    // calculation of the total amount of seconds till the end of the matching record
    // (assuming that airtableRecord2 is sorted ascendingly)
    var totalSecondsTillTheEnd;
    // if the present moment is bigger than the last record
    if(totalSecondsNow > airtableRecord2Array[airtableRecord2Array.length - 1]){
        // it means that we are in the first record
        index = 0;
        // then, calculate the total amount of seconds taking into account the remaining time from the last record
        totalSecondsTillTheEnd = (totalSecondsDay - totalSecondsNow) + airtableRecord2Array[index];
    }else{
        // search for the record according to the present moment
        for(var i = 0; i < airtableRecord2Array.length; i++){
            if(totalSecondsNow <= airtableRecord2Array[i]){
                index = i;
                break;
            }
        }
        // calculate the total amount of seconds remaining till the end of the record
        totalSecondsTillTheEnd = airtableRecord2Array[index] - totalSecondsNow;
    }

    // calculate countdown
    var hrsTillTheEnd = parseInt(totalSecondsTillTheEnd / 3600);
    var minsTillTheEnd = parseInt((totalSecondsTillTheEnd % 3600) / 60);
    var secsTillTheEnd = (totalSecondsTillTheEnd % 3600) % 60;

    // round up the minutes
    var lastMinute = 0;
    if(roundUpMins){ lastMinute = 1; }
    if (roundUpMins && !devMode) { minsTillTheEnd = minsTillTheEnd + lastMinute; }

    // format countdown
    var HHTillTheEnd = hrsTillTheEnd;
    var MMTillTheEnd = minsTillTheEnd;
    var SSTillTheEnd = secsTillTheEnd;
    
    if (HHTillTheEnd < 10) { HHTillTheEnd = "0" + HHTillTheEnd; }
    if (MMTillTheEnd < 10) { MMTillTheEnd = "0" + MMTillTheEnd; }
    if (SSTillTheEnd < 10) { SSTillTheEnd = "0" + SSTillTheEnd; }

    // display countdown
    record1.textContent = airtableRecord1Array[index];
    var minsHighlighted = airtableRecord6Array[index];

    if(devMode){
        changeColors("#222","#bbb");
        document.getElementById("countdown").style.fontSize = "200px";
        document.getElementById("dev").style.display = "block";
        countdownElem.textContent = HHTillTheEnd + ":" + MMTillTheEnd + ":" + SSTillTheEnd;
    }else{
        if(hrsTillTheEnd == 0){
            countdownElem.textContent = (minsTillTheEnd);
            if((minsTillTheEnd) <= minsHighlighted){
                changeColors(highlightedColor,highlightedBackgroundColor);
            }else{
                changeColors(airtableRecord4Array[index],airtableRecord5Array[index]);
            }
        }else{
            changeColors(airtableRecord4Array[index],airtableRecord5Array[index]);
            countdownElem.textContent = hrsTillTheEnd + ":" + (MMTillTheEnd);
        }
    }

    // trigger sound
    if(hrsTillTheEnd == 0 && minsTillTheEnd == minsHighlighted && secsTillTheEnd == 59 ||
        hrsTillTheEnd == 0 && minsTillTheEnd == lastMinute && secsTillTheEnd <= 2){
        beep.play();
    }

    // format calendar and clock
    if (yy < 10) { yy = "0" + yy; } 
    if (mm < 10) { mm = "0" + mm; } 
    if (dd < 10) { dd = "0" + dd; } 

    if (HH < 10) { HH = "0" + HH; }
    if (MM < 10) { MM = "0" + MM; }
    if (SS < 10) { SS = "0" + SS; }

    footerLElem.textContent = yy + " " + mm + " " + dd;
    footerRElem.textContent = HH + ":" + MM + ":" + SS;
    
    if(index < airtableRecord1Array.length - 1){
        next = airtableRecord1Array[index + 1];
    }else{
        next = airtableRecord1Array[0];
    }

    footerElem.textContent = "next: " + next;

}

/////////////////// 

function changeColors(c, b){
    record1.style.color = c;
    countdownElem.style.color = c;
    footerElem.style.color = c;
    footerLElem.style.color = c;
    footerRElem.style.color = c;

    document.body.style.background = b;
}

/////////////////// airtable calendar

var Airtable = require('airtable');
var base = new Airtable({apiKey: airtableApiKey}).base(airtableBaseKey);

base(airtableBaseName).select({
    view: airtableViewName
}).eachPage(function page(records) {
    records.forEach(function(record) {
        airtableRecord1 = record.get(airtableRecord1Name);
        airtableRecord1Array.push(airtableRecord1);
        airtableRecord2 = record.get(airtableRecord2Name);
        airtableRecord2Array.push(airtableRecord2);
        airtableRecord3 = record.get(airtableRecord3Name);
        airtableRecord3Array.push(airtableRecord3);
        airtableRecord4 = record.get(airtableRecord4Name);
        airtableRecord4Array.push(airtableRecord4);
        airtableRecord5 = record.get(airtableRecord5Name);
        airtableRecord5Array.push(airtableRecord5);
        airtableRecord6 = record.get(airtableRecord6Name);
        airtableRecord6Array.push(airtableRecord6);
    });
    
    if(!timetableLoaded) { timetable(); }

}, function done(err) {
    if (err) { console.error(err); return; }
});

function timetable(){
    for(var i = 0; i < airtableRecord3Array.length; i++){
        record4.insertAdjacentHTML('beforeend', "<ul>" + airtableRecord3Array[i] + "</ul>");
    }
    timetableLoaded = true;
}