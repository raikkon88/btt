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

echo "--> CREATING VIRTUAL ENVIRONMENT AND SETTING UP PROJECT <--"
# Generem entorn virtual i l'activem
sudo pip install virtualenv
virtualenv bttenginyersenv
source bttenginyersenv/bin/activate

echo "- INSTALLING DEPENDENCIES INSIDE ENVIRONMENT"
# Installem django
pip install django
pip install requests
pip install Pillow
echo "- MIGRATING DATABASE"
# Generem la base de dades i migrem 
python manage.py migrate
echo "- CREATING SUPER USER"
# Creem l'usuari. 
echo "from django.contrib.auth.models import User; User.objects.create_superuser('btt', 'btt@btt.com', 'bttenginyers')" | python manage.py shell
echo "- COLLECTING STATIC FILES"
# Recollim tots els recursos
python manage.py collectstatic --noinput
# desactivem l'entorn virtual
echo "--> SETTING UP THE APPLICATION <--"
# Encenem l'aplicació per el port 8000
python manage.py runserver 0.0.0.0:8000 & 
echo "--> FINISHED WITHOUT ERRORS <--"

exit

#echo "--> CONFIGURING APACHE 2 <--"
#sudo mv 000-default.conf /etc/apache2/sites-available/000-default.conf
#echo "- CHANGING SQLITE 3 PERMISSIONS"
#sudo chmod 664 ~/bttenginyers/db.sqlite3
#sudo chown :www-data ~/bttenginyers/db.sqlite3
#sudo chown :www-data ~/bttenginyers
#echo "- RESTARTING APACHE"
#sudo systemctl restart apache2
#echo "- APACHE RESTARTED"