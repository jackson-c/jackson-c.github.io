
var test_data = {
  "commands": [
    {
      "time": 0,
      "type": "slider",
      "id": "var_city",
      "value": 0
    },
    {
      "time": 0,
      "type": "slider",
      "id": "var_school",
      "value": 0
    },
    {
      "time": 0,
      "type": "slider",
      "id": "var_class",
      "value": 0
    },
    {
      "time": 0,
      "type": "value",
      "id": "opt_enabled",
      "key": "checked",
      "value": true
    },
    {
      "time": 0.1,
      "type": "click",
      "id": "generate_button"
    },



    {
      "time": 3,
      "type": "slider",
      "id": "gpa_sat_slider",
      "value": 0,
      "interpolate": true
    },
    {
      "time": 5,
      "type": "slider",
      "id": "gpa_sat_slider",
      "value": 80,
      "interpolate": false
    },
    {
      "time": 7,
      "type": "slider",
      "id": "gpa_sat_slider",
      "value": 20,
      "interpolate": false
    },
    {
      "time": 13,
      "type": "slider",
      "id": "gpa_sat_slider",
      "value": 100,
      "interpolate": true
    },
    {
      "time": 14,
      "type": "slider",
      "id": "gpa_sat_slider",
      "value": 0,
      "interpolate": true
    },
  ]
};

function controller_update() {
	delayFrame(controller_update);

	if (controller_last_frametime != 0) {
		controller_frametimes.all[0] = ((controller_frametimes.all[0]*controller_frametimes.all[1])+(curTime()-controller_last_frametime))/(controller_frametimes.all[1]+1);
		controller_frametimes.all[1]++;
		if (controller_sliding) {
			controller_frametimes.slide[0] = ((controller_frametimes.slide[0]*controller_frametimes.slide[1])+(curTime()-controller_last_frametime))/(controller_frametimes.slide[1]+1);
			controller_frametimes.slide[1]++;
		}
	}
	controller_last_frametime = curTime();

	controller_sliding = false;
	for (var i = 0; i < controller_interpolation.length; i++) {
		var next = controller_interpolation[i];
	    if (next.endTime <= controllerCurTime()) {
	        controller_interpolation.splice(i--, 1);
	    } else {
	    	controller_sliding = true;
	    	var lrp = (controllerCurTime()-next.startTime)/(next.endTime-next.startTime);
	    	var val = Math.floor(lerp(next.startValue, next.endValue, lrp));
	    	if (val != next.lastValue) {
	    		next.lastValue = val;
	    		next.target.value = val; 
				if (typeof next.target.oninput == 'function') { next.target.oninput(); }
	    	}
	    }
	}

	while(controller_active && (test_data.commands[controller_command_index].time<=controllerCurTime())) {
		controller_trigger(test_data.commands[controller_command_index]);
		controller_command_index++;
		if(controller_command_index >= test_data.commands.length) {
			controller_end();
		}
	}
}
delayFrame(controller_update);

var controller_last_frametime = 0;
var controller_sliding = false;

var controller_start = 0;
var controller_command_index = 0;
var controller_active = false;
var controller_interpolation = [];

var controller_frametimes = {"slide":[0,0], "all":[0,0]};

function controller_run() {
	test_data.commands.sort(function(a,b) { return a.time-b.time });
	controller_start = curTime();
	controller_command_index = 0;
	controller_active = true;
	controller_interpolation = [];
	controller_frametimes = {"slide":[0,0], "all":[0,0]};
	document.getElementById("controller_output").innerHTML = "Running...";
}

function controller_end() {
	controller_active = false;
	document.getElementById("controller_output").innerHTML = "AVG Frame times:<br>Sliding: "+Math.floor(controller_frametimes.slide[0])+"ms<br>All: "+Math.floor(controller_frametimes.all[0])+"ms";
}

function controller_trigger(command) {
	var target = document.getElementById(command.id);
	switch(command.type) {
		case "slider":
			target.value = command.value; 
			if (typeof target.oninput == 'function') { target.oninput(); }
			if(command.interpolate) {
				var i = controller_command_index+1;
				while(i < test_data.commands.length) {
					var next = test_data.commands[i];
					if (next.type == "slider" && next.id == command.id) {
						controller_interpolation.push({
							"target": target,
							"lastValue": command.value,
							"startTime": command.time,
							"startValue": command.value,
							"endTime": next.time,
							"endValue": next.value
						});
						return;
					}
					i++;
				}
			}
		break;
		case "click":
			target.click(); 
		break;
		case "value":
			target[command.key] = command.value; 
			if (typeof target.oninput == 'function') { target.oninput(); }
			if (typeof target.onclick == 'function') { target.onclick(); }
		break;
	}
}

function controllerCurTime() {
	return (curTime()-controller_start)/1000.0;
}