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
    console.log("2 - s'ha retornat el valor de la cookie amb protecció. ");
    return cookieValue;
}

console.log("1 - es crida a la cookie ");
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

console.log("3 - S'instancia la crida ajax")
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

console.log("4 - crida instanciada");
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
			console.log(target.id);

  			var img = $(".img_container");
  			var item = img.find("#"+target.id).clone();
  			init[target.id].setMoved(false);
  			
  			var listId = "#"+target.id+"-container";
  			console.log(item);
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

		console.log(obj);
	}
}


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
			console.log(target.id);

  			var img = $(".img_container");
  			var item = img.find("#"+target.id).clone();
  			init[target.id].setMoved(false);
  			
  			var listId = "#"+target.id+"-container";
  			console.log(item);
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
	console.log(init);
	// Makes the ajax petition.
	$.ajax({
    	url: 'http://localhost:8000/ws/processobjects/',
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





/// OLD FUNCTIONS _________________________________________________________________________________

// PRE: json conté les dades dels objectes rebuts
// POST: Genera els contenidors adients per els diferents objectes rebuts.
/*function createTemplate(json, path){

	var element;
	var model;

	console.log(json);

	switch (json.model){
		case "bttviewer.booleanobject":
			model = "BooleanObject";
			element = $('<div id="bool-'+json.pk+
						'" class="obj" style="width:'+json.fields.a_width+
						'px;height:'+json.fields.a_height+
						'px;float:left" align="center"></div>');
			var image;
			if(json.fields.a_value){
				image = $('<img src="'+ path +json.fields.a_image_on+
				  '" style="width:'+json.fields.a_width+'px"/>');
			}
			else{
				image = $('<img src="'+ path +json.fields.a_image_off+
				  '" style="width:'+json.fields.a_width+
				  'px;height:'+json.fields.a_height+'px;"/>');
			}
			image.appendTo(element);
		break;
		case "bttviewer.valve3waysobject":
			model = "Valve3WaysObject";
			element = $('<div id="valve-'+json.pk+'" '+
							 'class="obj" '+
							 'style="width:'+json.fields.a_width+'px;' +
							 		'float:left" '+
							 'align="center"></div>');
			var valueDiv = $('<div><span>' + json.fields.a_value + '</span></div>');
			var imageDiv = $('<div style="width:'+json.fields.a_width +'px;'+
										 'height:' + json.fields.a_height + 'px;' + 
										 'float:left;'+
										 '-webkit-transform:rotate('+json.fields.a_rotation+'deg);'+
										 '-ms-transform:rotate('+json.fields.a_rotation+'deg);'+
										 'transform:rotate('+json.fields.a_rotation+'deg);">');
			var image;
			if(json.fields.a_as_boolean){
				if(json.fields.a_value == 100){
					image = $('<img src="'+ path +json.fields.a_image_a+'" '+
							   'style="width:'+json.fields.a_width+'px"/>');
				}
				else{
					image = $('<img src="'+ path +json.fields.a_image_b+'" '+
							   'style="width:'+json.fields.a_width+'px"/>');
				}
			}
			else{
				image = $('<img src="'+ path +json.fields.a_image_ab+'" '+
							   'style="width:'+json.fields.a_width+'px"/>');
			}
			image.appendTo(imageDiv);
			valueDiv.appendTo(element);
			imageDiv.appendTo(element);
		break;
		case "bttviewer.analogobject":
			model = "AnalogObject";
			element = $('<div id="sonda-'+ json.pk +
						'" class="obj" style="width:'+json.fields.a_width+
						'px;height:'+json.fields.a_height+
						'px;background:'+json.fields.a_color+
						'; float:left" align="center">' + json.fields.a_value + '</div>');
		break;
	}
	
	var container = $('<div id="'+ model +'-' + json.pk + '-container" class="row value_row"></div>');
	var row = $('<div class="col-xs-12"></div>');
	var name = $('<div class="object-name" style="float:right">'+json.fields.a_name+'</div>');

	element.appendTo(row);
	name.appendTo(row);
	row.appendTo(container);

	//templates[model+"-"+json.pk] = container;
	if(json.fields.a_moved){
		inserted[model+"-"+json.pk] = container;
		var bObject = new BaseObject();
		bObject.createFromJson(json, path );
		appendToInserted(bObject, container);
	}
}



// PRE: BaseObject -> objecte que s'ha inserit a la llista. element -> objecte de la llisa que s'ha de moure. 
// POST: Inserta el nom de element a la llista d'inserits que li pertoca segons BaseObject
function appendToInserted(baseObject, element){

	inserted[baseObject.getKey()] = element;
	var parent = getTheInsertedList(baseObject);	
	var container = $('<div id="' + baseObject.getKey() + '-container" style="padding:5px;border:1"></div>');
	var text = $('<p style="float:left;width:80%"></p>').text(baseObject.getName());
	var button = $('<button name="' + baseObject.getKey() + '"  onclick="recover(this.name)" style="padding:5px;float:right;width:15%">D</button>');
	container.append(text);
	container.append(button);
	parent.append(container);
}
*/


// ON CLICK FUNCTIONS **************************************************

// PRE: key és una cadena pertanyent a l'id de l'objecte a recoperar.
// POST: Treu l'objecte[id = key] de la imatge i el torna a la llista que li pertoca
// - Es crida des de l'html. (es genera la crida quan s'inserta l'objecte a la imatge)
function recover(key){
	
	var element = inserted[key];
	delete inserted[key];

	var obj = element.find(".obj");
	obj[0].style.left = 0 + "px";
	obj[0].style.top = 0 + "px";



	$(".img_container").droppable({
		accept: ".obj",
		drop: dropToImg,
	});

	obj.draggable({
		stack: ".obj",
		cursor: "move",
		revert:true,
		distance: 10,
		snap: true,
	});

	var str = "#"+obj[0].id;
	$(".img_container").find(str).remove();
	obj.appendTo(element.find('.col-xs-12'));
	var parent = getTheParentList(init[key]);
	element.appendTo(parent);
	var toDel = getTheInsertedList(init[key]);
	toDel.find(str + "-container").remove();
	init[key].setMoved(false);

}

// PRE: --
// POST: Actualitza tots els elements del map global modified
/*function save(){
	// Converts all objects in a json map.
	var json = JSON.stringify(init);
	// Makes the ajax petition.
	$.ajax({
    	url: 'http://localhost:8000/ws/processobjects/',
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
*/
// UTILITIES FUNCTIONS **************************************************


// PRE: baseObject conté el tipus de l'element
// POST: Retorna la llista que li pertoca referent al tipus de baseObject
/*function getTheInsertedList(baseObject){

	var parent;
	if(baseObject.isType("valve")){
		parent = $("#valvulesAfegides");
	}
	else if(baseObject.isType("consigna")){
		parent = $("#consignesAfegides");
	}
	else if(baseObject.isType("sonda")){
		parent = $("#sondesAfegides");
	}
	else if(baseObject.isType("bool")){
		parent = $("#booleansAfegids");
	}
	return parent;
}


// PRE : baseObject -> objecte generat del map de inserits
// POST: Retorna la llista per inserir referent al tipus de baseObject
function getTheParentList(baseObject){
	
	var parent;
	if(baseObject.isType("valve")){
		parent = $("#valvulesInicials");
	}
	else if(baseObject.isType("consigna")){
		parent = $("#consignesInicials");
	}
	else if(baseObject.isType("sonda")){
		parent = $("#sondesInicials");
	}
	else if(baseObject.isType("bool")){
		parent = $("#boolsInicials");
	}
	return parent;
}
*/