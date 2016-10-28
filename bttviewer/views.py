from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.template import loader, RequestContext
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required

from django.core import serializers
from django.conf import settings
#from .models import AnalogFlagObject
from .models import BooleanObject
from .models import AnalogObject
from .models import Valve3WaysObject
from .models import MiniServer
from .models import Plane
from itertools import chain
import requests
import json
import re
import sys

###################################################################################################
# RENDERS
# - Custom renders to add the differents parameters needed to work.
###################################################################################################

def CustomRender(file, request, parameters):
	parameters['base_url'] = request.META['HTTP_HOST']
	parameters['STATIC_URL'] = 'http://' + request.META['HTTP_HOST'] + settings.STATIC_URL
	return render(
		request,
		file,
		parameters,
		RequestContext(request)
	)

def SimpleCustomRender(file, request):
	return CustomRender(file, request, {})

###################################################################################################
# PAGES
# - This are the different pages accessible for login users
###################################################################################################

@login_required(login_url='/login')
def home(request):
	miniserver_objects = MiniServer.objects.all()
	parameters = {
		'MiniServers' : miniserver_objects,
	}
	return CustomRender('bttviewer/home.html',request, parameters)


@login_required(login_url='/login')
def miniserver(request, miniserver_id):
	plane_objects = Plane.objects.filter(a_server_id=miniserver_id)
	parameters = {
		'PlaneObjects' : plane_objects
	}
	#return HttpResponse(template.render(context, request))
	return CustomRender('bttviewer/miniserver.html', request, parameters)

@login_required(login_url='/login')
def plane(request, plane_id):
	plane_obj = Plane.objects.get(pk=plane_id)
	
	analogs = AnalogObject.objects.filter(a_plane=plane_obj)
	booleans = BooleanObject.objects.filter(a_plane=plane_obj)
	valves = Valve3WaysObject.objects.filter(a_plane=plane_obj)

	objects = list(chain(analogs, booleans, valves))

	for obj in objects:
		obj.makeRequest(plane_obj.getMiniserverSelectPath());

	json_objects = serializers.serialize("json",objects)

	parameters = {
		'plane' : plane_obj,
		'objects' : objects,
		'json_objects':json_objects,
	}

	return CustomRender('bttviewer/plane.html', request, parameters)

@login_required(login_url='/login')
def reloadQuery(request, object_id):

	key = object_id[object_id.index('-') + 1 :object_id.index('-') + (len(object_id) - object_id.index('-'))]
	obj = None

	if "BooleanObject" in object_id:
		obj = BooleanObject.objects.get(pk=key)	
	elif "AnalogObject" in object_id:
		obj = AnalogObject.objects.get(pk=key)
	elif "Valve3WaysObject" in object_id:
		obj = Valve3WaysObject.objects.get(pk=key)
	else:
		 HttpResponse(status=500)

	obj.makeRequest(obj.a_plane.getMiniserverSelectPath())
	if obj.a_value == None or obj.a_value == '':
		return HttpResponse(status=500)
	else:
		return JsonResponse('{' + str(obj.a_value) + '}', safe=False)


@login_required(login_url='/login')
def request_value(request, object_id):
	baseObj = BaseObject.objects.get(pk=object_id)
	return 25

###################################################################################################
# LOGIN AND SESSION CALLS: 
# - This are the different login requests. 
###################################################################################################

def user_login(request):
	
	context = RequestContext(request)
	if request.user.is_authenticated():
		return home(request)
	else:
		if request.method == 'POST':
			username = request.POST['username']
			password = request.POST['password']

			user = authenticate (username=username, password=password)

			if user:
				if user.is_active:
					login(request, user)
					return HttpResponseRedirect('/home')
				else:
					return user_no_active(request)
			else: 
				print "login bad {0} , {1}".format(username, password)
				return user_bad_credentials(request)
		else : 
			form = AuthenticationForm()
			return login_form(request, form, context)

@login_required(login_url='/login')
def user_logout(request):
	logout(request)
	return HttpResponseRedirect("/login")

def user_no_active(request):
	return SimpleCustomRender('bttviewer/not_active.html', request)

def user_bad_credentials(request):
	return SimpleCustomRender('bttviewer/not_user.html', request)

def login_form(request, form , context):
	return CustomRender('bttviewer/login_form.html', request, {'form':form,'notlogged':True})