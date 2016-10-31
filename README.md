# README file for bttEnginyers

## Set up raspberry :

1 . Accedir a la següent web i descarregar-se Raspbian Jessie with PIXEL

[Pàgina de raspberry](https://www.raspberrypi.org/downloads/raspbian/)

2 . Seguir el manual que hi ha a l'enllaç següent

Ometre el pas de descarregar-se el Win32DiskImager si ja el tens instal·lat. 

[Manual d'instal·lació Windows](https://www.raspberrypi.org/documentation/installation/installing-images/windows.

3 . Configurar teclat 

obrir la raspberry i entrar a : 

INICI (representat amb una strawberry o frambuesa) -> Preferences -> Mouse and Keyboard. 

Un cop dins Seleccionar pestanya keyboard i apretar el botó "Keyboard Layout". 

A la pantalla que apareix seleccionar spain al country i després a la variant el Catalan (Spain, with middle dot). 

Es pot provar si s'ha escollit la adequada amb el requadre que diu "Type here to test your keyboard". 

## Automatic Installation

This package is prepared to be installed into a Raspberry executing the next commands 

Getting into the user directory.

	cd ~/

Getting bit bucket repository

	git clone https://bttenginyeria@bitbucket.org/raikkon88/btt.git

**This action has generated our development project 'bttenginyers' into the raspberry pi home.**

Going inside project folder and executing the init file. 

	cd btt/  
	sudo chmod u+x startinit.bash
	./startinit.bash	

This action will perform different installations and will set up a virtual environment where all the python packages will be located. When the installation finishes an user 'btt' with a password 'bttenginyers' will be created. Generate another user and delete this one. 

Now the server is on and you can access to admin control of this side in the next url : http://**server_ip**:8000/admin

Remember to change server_ip to the real server ip. And perform the mentioned actions with the users. 


###From Windows : 

First of all [Install putty.](http://www.putty.org/)

Open putty and configure the connection with the ip of the raspberry ans connect it throught the port 22 and the user 'pi'.

###From Linux or Mac : 

Open terminal and use the next command : 

    ssh pi@<ip>

Where <ip> is the pi ip. 

For both connections password will be raspberry. 

From here you can do the activate commands withour problems. 

**Enjoy!**