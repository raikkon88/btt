# README file for bttEnginyers

## Automatic Installation

This package is prepared to be installed into a Raspberry executing the next commands 

Getting into the user directory.

	cd ~/

Getting bit bucket repository

	git clone https://raikkon88@bitbucket.org/raikkon88/btt.git

**This action has generated our development project 'bttenginyers' into the raspberry pi home.**

Going inside project folder and executing the init file. 

	cd btt/  
	sudo chmod u+x startinit.bash
	./startinit.bash	

This action will perform different installations and will set up a virtual environment where all the python packages will be located. When the installation finishes an user 'btt' with a password 'bttenginyers' will be created. Generate another user and delete this one. 

Now the server is on and you can access to admin control of this side in the next url : http://**server_ip**:8000/admin

Remember to change server_ip to the real server ip. And perform the mentioned actions with the users. 

## How to start or stop pi server. 

If you have stopped pi and you want to start it only do the next steps : 

1 - Open a terminal 
2 - Tip the next commands in that order

    cd ~/btt/
    cd bttenv/
    source bin/activate
    cd ..
    python manage.py runserver 0.0.0.0:8000

3 -  Now you can access to http://<ip>:8000 and see the result. 

## Connect to the raspberry once installed from ssh

To connect to raspberry using ssh protocol please follow the next steps. 

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