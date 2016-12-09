// Scripts per proporcionar el moviment dels elements
// El tipus d'element ha de tenir el següent tag: 
//	<div class='obj' onmousedown="setMoving(this)" onmouseup="setNotMoving(this)">
//
//

// GLOBAL OBJECTS *******************************************************
var init = new Map();

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// ONLOAD FUNCTIONS *******************************************************

// Pre: -- 
// Post: Dota tots els objectes de la classe .obj la propietat de ser moguts
$(function reload(){

	$(".img_container").droppable({
		accept: ".obj",
		drop: dropToImg,
	});

	$(".obj").draggable({
		stack: ".obj",
		cursor: "move",
		revert:true,
		distance: 10,
		snap: true,
	});

	$(".img_container").find(".obj").dblclick(function(self) {
			var target = self.currentTarget;

  			var img = $(".img_container");
  			var item = img.find("#"+target.id).clone();
  			init[target.id].setMoved(false);
  			
  			var listId = "#"+target.id+"-container";
  			item[0].style.left = "0px";
  			item[0].style.top   = "0px";
  			item[0].style.position = "relative";

  			item.draggable({
				stack: ".obj",
				cursor: "move",
				revert:true,
				distance: 10,
				snap:true,
			});

  			item.appendTo(listId);


  			img.find("#"+target.id).remove();
  			
		});

});

/// NEW FUNCTIONS _________________________________________________________________________________

// PRE: map empty, list conté els objectes a transformar en json.
// POST: Emplena el map amb els objectes de list transformats en BaseObject.
function insertListToMap(map, list, path){

	for(var i = 0; i < list.length; i++){
		var obj = new BaseObject();
		obj.createFromJson(list[i], path);
		map[obj.getKey()] = obj;

	}

	reloadAllValues(map, list);
}

// INFINITE LOOP PART -----------------------------------------------------------------
// This three functions allows an infinite loop which can call recursively the process thread.

function reloadInfiniteLoop(init, list){
	var i = 0;
	var millisecondsToWait = 2000;
	setTimeout(function() {
		reloadAllValues(init, list);
	}, millisecondsToWait);	
}

function reloadAllValues(init, list){
	
	for(var o in init){
		console.log(init[o]);
		var element = document.getElementById(o);
		var string = o+"-value";
		var element = document.getElementById(string);
		var string = o+"-image";
		var image = document.getElementById(string);
		console.log(element);
		doReloadAjax('reload/'+ o + "/", element, image);
	}
	reloadInfiniteLoop(init, list);
}

function doReloadAjax(path, element, image){

	$.ajax({
    	url: path,
    	type: "POST",
    	success: function (response) {

    		var jsonResponse = JSON.parse(response);

    		console.log(response);
    		if(path.includes("AnalogObject")){
    			if(element != null)
    				element.innerHTML = jsonResponse.value;
    		}
    		else{
    			if(image != null){
    				var pathResponse = jsonResponse.path.replace("static", "static/bttviewer");
					image.src = pathResponse;
    			}
    			if(path.includes("Valve3WaysObject")){
    				if(element != null)
    					element.innerHTML = jsonResponse.value;
    			// Ha de tornar la imatge que li pertoca.
	    		}	
    		}
    		
    		
 			
    	},   
		error: function (response){

			var parent = null;
			if (element != null) {
				parent = element.parentElement;
				parent.style.background = "red";
			}
			if(image != null){
				parent = image.parentElement;
				parent.style.background = "red";
			}

			
		},
	});
}

// ------------------------------------------------------------------------------

// DRAGGABLE FUNCTIONS *******************************************************

// Pre: event-> event generat per el dreggable, ui-> objecte mogut
// Post: implementa la lògica del moviment després d'arrossegar l'objecte
function dropToImg(event, ui){

	// Recullo la imatge
	var img = $(".img_container");
	// Miro si està inserit o no.
	var inserted = img.find(ui.draggable[0]).length != 0;

	// Permeto que es reverteixi si no es compleix la restricció.
	ui.draggable.draggable( 'option', 'revert', false );

	// Obtinc i actualitzo l'element a inserir.

	var element = ui.draggable.clone();
	element[0].style.position= "absolute";
	element[0].style.left = (ui.offset.left - img.offset().left - 4) + "px";
	element[0].style.top = (ui.offset.top - img.offset().top  - 4) + "px";

	// El torno a fer draggable
	element.draggable({
		stack: ".obj",
		cursor: "move",
		revert:true,
		distance: 10,
		snap:true,
	});


	if(!inserted){
		element.appendTo('.img_container');
		

		element.dblclick(function(self) {
			var target = self.currentTarget;

  			var img = $(".img_container");
  			var item = img.find("#"+target.id).clone();
  			init[target.id].setMoved(false);
  			
  			var listId = "#"+target.id+"-container";
  			item[0].style.left = "0px";
  			item[0].style.top   = "0px";
  			item[0].style.position = "relative";

  			item.draggable({
				stack: ".obj",
				cursor: "move",
				revert:true,
				distance: 10,
				snap:true,
			});

  			item.appendTo(listId);


  			img.find("#"+target.id).remove();
  			
		});
	}
	// Elimino l'element que ja he inserit.
	updateObject(ui.draggable, inserted);
}


// Pre: obj->objecte mogut, notInserted-> si true no està inserit a la imatge, si false està inserit a la imatge
// Post: Insereix o actualitza l'objecte que s'ha mogut.
function updateObject(obj, inserted){

	var img = $(".img_container");
	var baseObject;
	if(!inserted){

		baseObject = init[obj[0].id];
		baseObject.update(obj, img);
		baseObject.setMoved(true);

		// Eliminem l'element de la llista
		var list = $("#items-list").find("#"+baseObject.getKey()).remove();

	}
	else{
		// Actualitzem els objectes que tenim a les llistes. 
		init[obj[0].id].update(obj, img);
	}


}

// PRE: --
// POST: Actualitza tots els elements del map global modified
function save(){
	// Converts all objects in a json map.
	var json = JSON.stringify(init);
	// Makes the ajax petition.
	$.ajax({
    	url: '/ws/processobjects/',
    	type: "POST",
    	data: json,
    	success: function (response) {
    		// Ensenyem un popup conforme s'ha enviat correctament.
    		$('#sendOk').show().delay(5000).fadeOut();
    	},   
		error: function (response){
			// Ensenyem un popup conforme no s'ha pogut enviar la petició.
			$('#sendNotOk').show().delay(5000).fadeOut();
		},
	});
}
