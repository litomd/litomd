/***********************************
/* Windows handling routines and variables
/* for presenting pages in frames
/* as windows
/* By Leonel Morales Díaz
/* @litomd litomd.com ingenieriasimple.com
/* Version 1.0
/* Last date modified: 10/Feb/2015
/* See end of file for modifications history
/************************************/

// Add framable sites in this array
var win_sites = [
	"twitterlitomd.html",
	"http://scratch.mit.edu/projects/embed/35997606/?autostart=false",
	"https://www.flickr.com/photos/litomd/player/",
	"https://www.khanacademy.org/cs/puzzlegame/2169091620/embedded?editor=yes&amp;author=yes",
	"http://www.slideshare.net/slideshow/embed_code/41872784" //,
//	"https://es.khanacademy.org/profile/litomd/programs"
];

// Window titles go here, one per site
var win_titles = [
	"Twitter",
	"Scratch programas",
	"Flickr",
	"Khan Academy programas",
	"SlideShare" //,
//	"Tumblr en busca del interfaz de usuario",
//	"Flickr fotos",
];

// State constants
var win_SMin = 0;
var win_SMax = 1;
var win_SNor = 2;
var win_SX = -1;

// Percentage of the available screen to use for windows
var win_scr = 0.85;
// Calculated dimensions of viewing space
var win_scr_width = function() { return Math.round(window.innerWidth * win_scr); };
var win_scr_height = function() { return Math.round(window.innerHeight * win_scr); };
var win_scr_posx = function() { return Math.round((window.innerWidth - win_scr_width())/2); };
var win_scr_posy = function() { return Math.round((window.innerHeight - win_scr_height())/2); };

// Separation between windows
var win_sepx = 40;
var win_sepy = 20;
// Calculated dimensions of windows
var win_width =  function() { return win_scr_width() - win_sepx * (win_sites.length - 1); };
var win_height =  function() { return win_scr_height() - win_sepy * (win_sites.length - 1); };

// Array of window states objects forming a simply linked list
var win_states = new Array(win_sites.length);
var win_st_ini = win_sites.length - 1;
for (var i=0; i<win_states.length; i++) {
	win_states[i] = {
		state: win_SNor,
		posX: win_scr_posx() + win_sepx * (win_states.length - i - 1),
		posY: win_scr_posy() + win_sepy * (win_states.length - i - 1),
		winid: "win_" + ("000" + i).substr(-3),
		frid: "fr_" + ("000" + i).substr(-3),
		zIndex: -1,
		nextzwin: -1
	};
}

// Height of title bar for windows 
var wTBHeight = 20;
// Width for title bar symbols
var wTBWidth = 15;
// Symbols to use in title bar
var wTBReld = "&#8635;";
var wTBMn = "&#8650;";
var wTBR = "&plusmn;";
var wTBMx = "&#8648;";
var wTBX = "&times;";

// Basic style 
var win_style = "position:absolute; height:_height_px; width:_width_px; top:_top_px; left:_left_px;";

// Bring a clicked window to the front, uses simply linked list logic
function win_BringToFront(event) {
	if (win_sites.length == 1) return;
	var w_El = event.target.parentNode.parentNode.parentNode.parentNode;
	var tmpzI = w_El.style.zIndex;
	var cur_win = win_st_ini;
	var bus_win = -1;
	var fin_win = -1;
	while (cur_win != -1) {
		if (win_states[cur_win].winid == w_El.id) {
			bus_win = cur_win;
		}
		if (win_states[cur_win].nextzwin == -1) {
			fin_win = cur_win;
		} else {
			if (win_states[win_states[cur_win].nextzwin].winid == w_El.id) {
				bus_win = win_states[cur_win].nextzwin;
				win_states[cur_win].nextzwin = win_states[bus_win].nextzwin;
				if (win_states[bus_win].nextzwin == -1) fin_win = cur_win;
			}
		}
		cur_win = win_states[cur_win].nextzwin;
	}
	if (win_st_ini == bus_win) win_st_ini = win_states[bus_win].nextzwin;
	win_states[fin_win].nextzwin = bus_win;
	win_states[bus_win].nextzwin = -1;
	win_states[bus_win].zIndex = win_sites.length + 1;
	w_El.style.zIndex = win_states[bus_win].zIndex;
	cur_win = win_st_ini;
	while (cur_win != -1) {
		if (win_states[cur_win].zIndex > tmpzI) {
			win_states[cur_win].zIndex--;
			document.getElementById(win_states[cur_win].winid).style.zIndex = win_states[cur_win].zIndex;
		}
		cur_win = win_states[cur_win].nextzwin;
	}
}

// Main function, creates all the code for drawing the windows and returns the html string
function iFrameWins () {
	var RetStr = "";
	for (var i = win_sites.length; i>0 ; i--) {
		var DinStyle = win_style.replace("_top_",win_states[i-1].posY).replace("_left_",win_states[i-1].posX);
		DinStyle = DinStyle.replace("_height_",win_height()).replace("_width_",win_width());
		RetStr += "<div class=\"win_\" id=\"" + win_states[i-1].winid + "\" draggable=\"true\" ondragstart=\"win_drag(event);\" " +
			"style=\"" + DinStyle + "\">" +
			"<table style=\"width:100%; height:100%;\">" + 
			"<tr><th onclick=\"win_BringToFront(event);\" style=\"height:" + wTBHeight + "px;\">" + win_titles[i-1] + "</th>" +
			"<th style=\"width:" + wTBWidth + "px;\">" + wTBReld + "</th>" +
			"<th style=\"width:" + wTBWidth + "px;\">" + wTBMn + "</th>" +
			"<th style=\"width:" + wTBWidth + "px;\">" + wTBR + "</th>" +
			"<th style=\"width:" + wTBWidth + "px;\">" + wTBMx + "</th>" +
			"<th style=\"width:" + wTBWidth + "px;\">" + wTBX + "</th>" +
			"</tr>" + 
			"<tr><td style=\"height:100%;\" colspan=\"6\">" +
			"<iframe id=\"" + win_states[i-1].frid + "\" style=\"width:100%; height:100%;\" src=\"" + win_sites[i-1] + "\" " +
			"dragover=\"win_allowdrop(event)\" drop=\"win_drop(event)\"></iframe>" +
			"</td></tr></table></div>";
	}
	return RetStr;
}

// Check if all frames have loaded
function win_framesloaded() {
	var RetVal = true;
	for (var i=0; i<win_sites.length; i++) {
		RetVal = RetVal & (document.getElementById(win_states[i].frid).contentDocument.readyState == "complete");
	}
	return RetVal;
}

// After process
function win_onLoad() {
	document.addEventListener("drop",win_drop,false);
	document.addEventListener("dragover",win_allowdrop,false);
	for (var i=win_sites.length; i>0; i--) {
		if (win_states[i-1].zIndex == -1) {
			win_states[i-1].zIndex = win_sites.length - i + 1;
			win_states[i-1].nextzwin = i-2;
			document.getElementById(win_states[i-1].winid).style.zIndex = win_states[i-1].zIndex;
			window.setTimeout(win_onLoad,500);
			break;
		}
	}
}

// Drag and drop for windows

// Store window being dragged
var win_indrag;

function win_drag(event) {
	win_indrag = event.target;
	event.dataTransfer.setData("text", event.pageX + "," + event.pageY);
}

function win_drop(event) {
	event.preventDefault();
	var data = event.dataTransfer.getData("text").split(",");
	var tmpPx = parseInt(win_indrag.style.left); //.replace("px",""));
	tmpPx += event.pageX - data[0];
	win_indrag.style.left = tmpPx + "px";
	tmpPx = parseInt(win_indrag.style.top); //.replace("px",""));
	tmpPx += event.pageY - data[1];
	win_indrag.style.top = tmpPx + "px";
}

function win_allowdrop(event) {
	event.preventDefault();
}

/*************************************
/* Modifications history
/* 10/Feb/2015: added drag and drop of windows
/* 9/Feb/2015: added buttons for windows functions: minimize, reload, maximaze, etc.,
/* implementation pending
/* 6/Feb/2015: implented zIndex array to keep track of stack of windows
/************************************/