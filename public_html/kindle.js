// Define our global variables
var Planes        = {};
var PlanesOnTable = 0;
var PlanesToReap  = 0;
var Metric = false;

function fetchData() {
	$.getJSON('/dump1090/data.json', function(data) {
		// Loop through all the planes in the data packet
		for (var j=0; j < data.length; j++) {
			// Do we already have this plane object in Planes?
			// If not make it.
			if (Planes[data[j].hex]) {
				var plane = Planes[data[j].hex];
			} else {
				var plane = jQuery.extend(true, {}, planeObject);
			}
			
			/* For special squawk tests
			if (data[j].hex == '48413x') {
            	data[j].squawk = '7700';
            } //*/
            
			// Call the function update
			plane.funcUpdateData(data[j]);
			
			// Copy the plane into Planes
			Planes[plane.icao] = plane;
		}

		PlanesOnTable = data.length;
	});
}

// Initalizes the map and starts up our timers to call various functions
function initialize() {
	// Setup our timer to poll from the server.
	window.setInterval(function() {
		fetchData();
		refreshTableInfo();
		reaper();
	}, 1000);
}

// This looks for planes to reap out of the master Planes variable
function reaper() {
	PlanesToReap = 0;
	// When did the reaper start?
	reaptime = new Date().getTime();
	// Loop the planes
	for (var reap in Planes) {
		// Is this plane possibly reapable?
		if (Planes[reap].reapable == true) {
			// Has it not been seen for 5 minutes?
			// This way we still have it if it returns before then
			// Due to loss of signal or other reasons
			if ((reaptime - Planes[reap].updated) > 300000) {
				// Reap it.
				delete Planes[reap];
			}
			PlanesToReap++;
		}
	};
} 

// Right now we have no means to validate the speed is good
// Want to return (n/a) when we dont have it
// TODO: Edit C code to add a valid speed flag
// TODO: Edit js code to use said flag
function normalizeSpeed(speed, valid) {
	return speed	
}

// Returns back a long string, short string, and the track if we have a vaild track path
function normalizeTrack(track, valid){
	x = []
	if ((track > -1) && (track < 22.5)) {
		x = ["North", "N", track]
	}
	if ((track > 22.5) && (track < 67.5)) {
		x = ["North East", "NE", track]
	}
	if ((track > 67.5) && (track < 112.5)) {
		x = ["East", "E", track]
	}
	if ((track > 112.5) && (track < 157.5)) {
		x = ["South East", "SE", track]
	}
	if ((track > 157.5) && (track < 202.5)) {
		x = ["South", "S", track]
	}
	if ((track > 202.5) && (track < 247.5)) {
		x = ["South West", "SW", track]
	}
	if ((track > 247.5) && (track < 292.5)) {
		x = ["West", "W", track]
	}
	if ((track > 292.5) && (track < 337.5)) {
		x = ["North West", "NW", track]
	}
	if ((track > 337.5) && (track < 361)) {
		x = ["North", "N", track]
	}
	if (!valid) {
		x = [" ", "n/a", ""]
	}
	return x
}

// Refeshes the larger table of all the planes
function refreshTableInfo() {
	//var html = '<table id="tableinfo" width="100%"><tbody>';
	for (var tablep in Planes) {
		var tableplane = Planes[tablep]
		if (!tableplane.reapable && tableplane.fetched) {
			document.getElementById('flightvalue').innerHTML = tableplane.flight;

			if (tableplane.squawk != '0000' ) {
				document.getElementById('squawkvalue').innerHTML = tableplane.squawk;
		    } else {
				document.getElementById('squawkvalue').innerHTML = '&nbsp;';
		    }

			document.getElementById('altitudevalue').innerHTML = tableplane.altitude;
			document.getElementById('speedvalue').innerHTML = tableplane.speed;

			if (tableplane.vTrack) {
				document.getElementById('trackvalue').innerHTML =  normalizeTrack(tableplane.track, tableplane.vTrack)[2];
		    } else {
				document.getElementById('trackvalue').innerHTML = '&nbsp;';
		    }

			document.getElementById('aircrafttypevalue').innerHTML = tableplane.aircraftType;
			document.getElementById('destvalue').innerHTML = tableplane.dest;
			document.getElementById('destcityvalue').innerHTML = tableplane.destCity;
			document.getElementById('origvalue').innerHTML = tableplane.orig;
			document.getElementById('origcityvalue').innerHTML = tableplane.origCity;
			return;
		}
	}

	document.getElementById('aircrafttypevalue').innerHTML = '&nbsp;';
	document.getElementById('destvalue').innerHTML = '&nbsp;';
	document.getElementById('destcityvalue').innerHTML = '&nbsp;';
	document.getElementById('origvalue').innerHTML = '&nbsp;';
	document.getElementById('origcityvalue').innerHTML = '&nbsp;';
	document.getElementById('trackvalue').innerHTML = '&nbsp;';
	document.getElementById('altitudevalue').innerHTML = '&nbsp;';
	document.getElementById('speedvalue').innerHTML = '&nbsp;';
	document.getElementById('squawkvalue').innerHTML = '&nbsp;';
	document.getElementById('flightvalue').innerHTML = '&nbdp;';
}
