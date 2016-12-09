// MODEL BASE OBJECT 
class BaseObject {

	constructor(){
		
	}

	// SETTERS ********************************************

	createFromJson(json){
		this.modelType = this.getTheModel(json.model);
		this.key = json.pk;
		this.name = json.fields.a_name;
		this.x = json.fields.a_x;
		this.y = json.fields.a_y;
		this.img_width = json.fields.a_width;
		this.img_height = json.fields.a_height;
		this.moved = json.fields.a_moved;
		this.rotation = json.fields.a_rotation;
	}

	// PRE : ui fa referència al objecte mogut, img és la imatge on s'ha mogut.
	// POST : Construeix un objecte del tipus BaseObject
	setElement(ui, img){
		this.name = ui[0].parentNode.getElementsByClassName('object-name')[0].textContent.trim();
		this.key = this.getTheType(ui, false);
		this.modelType = this.getTheType(ui, true);
		this.x = ui.offset().left - img.offset().left - 4;
		this.y = ui.offset().top - img.offset().top - 4;
		this.img_width = img.width();
		this.img_height = img.height();
		this.moved = true;
		this.rotation = 0;
	}

	// PRE: obj -> objecte que s'ha mogut, img -> imatge per on s'ha mogut
	// POST: Actualitza la posició de l'objecte relatiu a la imatge que se li passa.
	update(obj, img){
		this.x = obj.offset().left - img.offset().left - 4;
		this.y = obj.offset().top - img.offset().top - 4;
	}

	// PRE: obj -> objecte que s'ha mogut, img -> imatge per on s'ha mogut
	// POST: Actualitza la posició de l'objecte relatiu a la imatge que se li passa.
	update(obj, img, maxWidth, maxHeight, imageWidth, imageHeight){
		var x = obj.offset().left - img.offset().left - 4;
		var y = obj.offset().top - img.offset().top - 4;
		this.x = (x * maxWidth) / imageWidth;
		this.y = (y * maxHeight) / imageHeight;
	}

	// PRE : --
	// POST: Si moved, moved i s'ha de cridar al update, si no moved x i y es posen a 0;
	setMoved(moved){
		if(!moved){
			this.x = 0;
			this.y = 0;
			// El següent valor dona problemes si té valor.
			this.moved = ""; // Aquest valor ha d'estar buit per poder fer bé la valoració. 
		}
		else 
		{
			this.moved = "True";
		}
	}

	// GETTERS ********************************************

	// Pre: obj és un element draggable amb un guió dins del id. 
	// Post:Trunka per el guió i es queda el principi si before, el final altrament.
	getTheType(obj, before){
		var id = obj[0].id;
		if(before){
			id = id.substr(0, id.indexOf('-')); 
		}
		else{
			id = id.substr(id.indexOf('-') + 1, id.length - 1);
		}
		return id;
	}

	// Pre : --
	// POST: Retorna una clau per poder indexar l'objecte en un MAP
	getKey(){
		return this.modelType + "-" + this.key;
	}

	// Pre: --
	// Post: retorna si la cadena que se li passa és igual al tipus de l'objecte
	isType(string){
		return string == this.modelType;
	}

	// Pre: --
	// Post: retorna l'amplada' de la imatge
	getWidth(){
		return this.img_width;
	}

	// Pre: --
	// Post: retorna l'alçada de la imatge
	getHeight(){
		return this.img_height;
	}

	// PRE : --
	// POST: Retorna el valor de la posició y
	getTop(){
		return this.y;
	}

	// PRE : -- 
	// POST: Retorna el valor de la posició x
	getLeft(){
		return this.x;
	}

	// PRE : -- 
	// POST: retorna el nom de l'objecte
	getName(){
		return this.name;
	}

	getTheModel(djangoModel){
		var toReturn; 
		switch(djangoModel){
			case "bttviewer.booleanobject":
				toReturn ="BooleanObject";
			break;
			case "bttviewer.valve3waysobject":
				toReturn ="Valve3WaysObject";
			break;
			case "bttviewer.analogobject":
				toReturn ="AnalogObject";
			break;
		}
		return toReturn;
	}

	
	getDatabaseType(){
		var toReturn;
		switch(this.modelType){
			case "BooleanObject":
				toReturn = "booleanobjects";
			break;
			case "Valve3WaysObject":
				toReturn = "valve3waysobjects";
			break;
			case "AnalogObject":
				toReturn = "analogobjects";
			break;
		}
		return toReturn;
	}
}
