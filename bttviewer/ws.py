from django.shortcuts import render
from django.http import Http404
from django.http import HttpResponse
from pprint import pprint
from django.core import serializers
from .models import BooleanObject
from .models import AnalogObject
from .models import Valve3WaysObject
from .models import MiniServer
from .models import Plane
import json

##############################################################################
#	UTILITIES
##############################################################################


def FillObject(json, obj):
	obj.a_x 			= float(json['x'])
	obj.a_y 			= float(json['y'])
	obj.a_moved 		= bool(json['moved'])
	if obj.a_moved:
		obj.a_moved = True
	else:
		obj.a_moved = False
	obj.a_img_width 	= float(json['img_width'])
	obj.a_img_height = float(json['img_height'])
	obj.a_rotation 	= float(json['rotation'])
	return obj

##############################################################################
#	SAVE METHODS
##############################################################################

def UpdateBooleanObjects(json):
	element = BooleanObject.objects.get(pk=json['key'])
	element = FillObject(json, element)
	return element.save()


def UpdateValveObjects(json):
	element = Valve3WaysObject.objects.get(pk=json['key'])
	element = FillObject(json, element)
	return element.save()


def UpdateAnalogObjects(json):	
	element = AnalogObject.objects.get(pk=json['key'])
	element = FillObject(json, element)
	return element.save()


##############################################################################
#	WEB SERVICE JSON GETTER
##############################################################################

def ProcessJsonObjects(request):

	data = request.POST.keys()
	objects = json.loads(data[0])
	for obj in objects:
		if "bool" in obj:
			UpdateBooleanObjects(objects[obj])
		elif "sonda" in obj:
			UpdateAnalogObjects(objects[obj])
		elif "valve" in obj:
			UpdateValveObjects(objects[obj])
		else:
			return HttpResponse(status=500)

	return HttpResponse(status=201)