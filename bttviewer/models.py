#!/usr/bin/python
# -*- coding: utf8 -*-
from __future__ import unicode_literals
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from btt import settings
import requests
import sys
import re

###################################################################################################
# MINISERVER OBJECTS
# - This class is used to store the configuration for a miniserver
###################################################################################################
class MiniServer(models.Model):

    a_name = models.CharField(max_length=100, default='', verbose_name='Nom')
    a_path = models.CharField(max_length=100, default='', verbose_name='Url del miniserver') 
    a_user = models.CharField(max_length=50, default='', verbose_name='Usuari administrador')
    a_password = models.CharField(max_length=50, default='', verbose_name='Password per usuari')

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
        return self.a_name

    ## Mounts the access path to miniserver
    ## Returns path as string
    def getSelectString(self):
        return "http://" + self.a_user + ":" + self.a_password + "@" + self.a_path

###################################################################################################
# PLANE OBJECTS
# - This class is linked with miniservers, every miniserver can have multiple plains.
# - Designed to store the image and to centralize the differents objects of this plains.
###################################################################################################
class Plane(models.Model):
    a_name = models.CharField(max_length=100, default='', verbose_name='Nom')
    a_image = models.ImageField(upload_to='media/%Y/%m/%d', verbose_name='Planol')
    a_server = models.ForeignKey(MiniServer, on_delete=models.CASCADE, verbose_name='Miniserver')

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
        print (self.a_server.getSelectString())
        return self.a_server.a_name + " -> " + self.a_name

###################################################################################################
# BASE OBJECTS
# - This is the base class for all the objects that must be displayed in a plane. 
# - This class configures the different values used to store position inside plane image.
###################################################################################################
class BaseObject(models.Model):
    # Atributes hidden
    a_x = models.FloatField(editable=False, default=0)
    a_y = models.FloatField(editable=False, default=0)
    a_moved = models.BooleanField(editable=False, default=False)
    a_img_width = models.FloatField(editable=False, default=0)
    a_img_height = models.FloatField(editable=False, default=0)
    # Atributes visible
    a_width = models.FloatField(verbose_name="Width")
    a_height = models.FloatField(verbose_name="Height")
    a_color = models.CharField(max_length=8, default='#FFFFFF', verbose_name='Color')
    a_rotation = models.IntegerField(verbose_name="Rotation", default=0)
    a_name = models.CharField(max_length=200, default='Element', verbose_name='Name')
    a_query = models.CharField(max_length=150, default='', verbose_name='Path (query to be done into Miniserver)')
    a_plane = models.ForeignKey(Plane, default=1, on_delete=models.CASCADE, verbose_name='Plane relation')

    ## Says that permits heritance in class.
    class Meta:
        abstract = True

    ## This method makes the ws query for element value to miniserver. 
    ## returns value as string, only reads value parameter for the xml result.
    ## - Can halt an exception during the process and will return error.
    def makeRequest(self, path):
        try:
            content = requests.get(path + self.a_query)
            if content.status_code == 401:
                print (path + self.a_query + "-> IDENTIFICATION FAILED, USER OR PASWORD NOT CORRECT")
            elif content.status_code == 500:
                print (path + self.a_query + "-> MINISERVER ERROR, CHECK CONNECTION")
            elif content.status_code == 404:
                print (path + self.a_query + "-> PAGE NOT FOUND")
            else:
                print (path + self.a_query + "-> OK")
                s = content.text.encode('ascii', 'ignore')
                s = str(s).replace('\r\n', '');
                result = re.match(r'.*value="(.*?)".*',s)
                if result: 
                    return result.group(1)
                else:
                    return result
        except:
            print("Unexpected error:", sys.exc_info())
            return "Error"

    ##
    ##
    ##
    def getImagePath(self):
        return settings.MEDIA_ROOT

###################################################################################################
# MINISERVER OBJECTS
# - This class is used to store the configuration for a miniserver
###################################################################################################
class BooleanObject(BaseObject):

    a_value = models.NullBooleanField(editable=False, null=True)
    a_image_on = models.ImageField(upload_to='images', default="", verbose_name='Image ON')
    a_image_off = models.ImageField(upload_to='images', default="", verbose_name='Image OFF')

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
       return 'Valor ON/OFF: ' + self.a_name

    ## Particular logic for boolean requests
    ## returns True, False or Error.
    def makeRequest(self, path):
        result = super(BooleanObject, self).makeRequest(path)
        if result == '0':
            self.a_value = False
        elif result == '1':
            self.a_value = True
        else: 
            self.a_value = result

###################################################################################################
# MINISERVER OBJECTS
# - This class is used to store the configuration for a miniserver
###################################################################################################
class AnalogObject(BaseObject):

    a_value = models.FloatField(editable=False, null=True)

    BaseObject._meta.get_field('a_width').verbose_name = "Width (Minim: 60px)"
    BaseObject._meta.get_field('a_height').verbose_name = "Height (Minim: 25px)"

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
        return 'Valor de Sonda: ' + self.a_name

    ## Particular logic for analog requests
    ## assign number as string into the a_value, if error returns 'Error'
    def makeRequest(self, path):
        result = super(AnalogObject, self).makeRequest(path)
        self.a_value = result + 'º'

###################################################################################################
# MINISERVER OBJECTS
# - This class is used to store the configuration for a miniserver
###################################################################################################
class AnalogFlagObject(BaseObject):

    a_value = models.FloatField(editable=False, null=True)
    a_image = models.ImageField(upload_to='images', default="", verbose_name='Image FLAG')    
    # OVERRIDING 
    BaseObject._meta.get_field('a_width').verbose_name = "Width (Minim: 60px)"
    BaseObject._meta.get_field('a_height').verbose_name = "Height (Minim: 25px)"

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
        return 'Consigna: ' + self.a_name

    ## Particular logic for flag requests
    ## assign number as string into the a_value, if error returns 'Error'
    def makeRequest(self, path):
        result = super(AnalogFlagObject, self).makeRequest(path)
        self.a_value = result + 'º'

###################################################################################################
# MINISERVER OBJECTS
# - This class is used to store the configuration for a miniserver
###################################################################################################
class Valve3WaysObject(BaseObject):
    a_value = models.FloatField(editable=False, null=True)
    a_as_boolean = models.NullBooleanField(editable=False, null=True)
    a_image_a = models.ImageField(upload_to='images', default="", verbose_name='Image (A -> AB) / (ON)')
    a_image_b = models.ImageField(upload_to='images', default="", verbose_name='Image (B -> AB) / (OFF)')
    a_image_ab = models.ImageField(upload_to='images', default="", verbose_name='Image A+B -> AB')

    ## Text seen in django admin
    ## Return a string 
    def __unicode__(self):
        return 'Vàlvula 2/3 vies: ' + self.a_name

    ## Particular logic for valve requests
    ## assign number as string into the a_value, defines if is necessary the boolean threatement.
    def makeRequest(self, path):
        result = super(Valve3WaysObject, self).makeRequest(path)
        try:
            result = result.replace('%', '')
            self.a_value = float(result)
            if (self.a_value == 100) or (self.a_value == 0):
                self.a_as_boolean = True
            else: 
                self.a_as_boolean = False
        except:
            self.a_value = 0
            print("Valve object conversion error:", sys.exc_info())

