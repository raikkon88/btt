#!/bin/bash
# Si es pretenen connexions ssh : 
# ssh pi@<IP> -> password = raspberry.

echo "--> UPDGRADING RASPBERRY PI <--"
# Actualitzem les eines
sudo apt-get update
yes | sudo apt-get upgrade
echo "- INSTALLING WEB SERVER AND DEPENDENCIES"
# Installem el servidor web per poder lliurar l'entorn de producció.
sudo apt-get -y install apache2 libapache2-mod-wsgi python-dev libjpeg8-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk
echo "--> UPDGRADED AND INSTALLATION COMPLETE <--"

echo "- INSTALLING DEPENDENCIES INSIDE ENVIRONMENT"
# Installem django
sudo pip install django
sudo pip install requests
sudo pip install Pillow
echo "- MIGRATING DATABASE"
# Generem la base de dades i migrem 
sudo python manage.py makemigrations bttviewer
sudo python manage.py migrate 
sudo python manage.py migrate bttviewer

echo "--> CREATING VIRTUAL ENVIRONMENT AND SETTING UP PROJECT <--"
# Generem entorn virtual i l'activem
sudo pip install virtualenv
sudo virtualenv bttenv
sudo source bttenv/bin/activate

# desactivem l'entorn virtual
echo "--> SETTING UP THE APPLICATION <--"
# Encenem l'aplicació per el port 8000
sudo rm -r /etc/apache2/sites-enabled/000-default.conf
sudo mv ~/btt/btt.conf /etc/apache2/sites-available/btt.conf
sudo a2ensite btt.conf
sudo chown -R www-data ~/btt/
sudo chgrp -R www-data ~/btt/
sudo chmod 664 ~/btt/db.sqlite3
sudo service apache2 restart

echo "- CREATING SUPER USER"
# Creem l'usuari. 
echo "from django.contrib.auth.models import User; User.objects.create_superuser('btt', 'btt@btt.com', 'bttenginyeria')" | sudo python manage.py shell

echo "- COLLECTING STATIC FILES"
# Recollim tots els recursos
sudo python manage.py collectstatic --noinput
sudo chown -R www-data ~/btt/static

exit

