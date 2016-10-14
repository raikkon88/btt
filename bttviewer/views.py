from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.template import loader, RequestContext
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from .models import BooleanObject
from .models import AnalogFlagObject
from .models import AnalogObject
from .models import Valve3WaysObject
from .models import MiniServer
from .models import Plane
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
	plane_objects = Plane.objects.get(a_server_id=miniserver_id)
	parameters = {
		'PlaneObjects' : plane_objects
	}
	#return HttpResponse(template.render(context, request))
	return CustomRender('bttviewer/miniserver.html', request, parameters)


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