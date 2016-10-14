from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^login/', views.user_login, name='login'),
    url(r'^logout/', views.user_logout, name='logout'),
    url(r'^home/', views.home, name='home'),
    url(r'^miniserver/(?P<miniserver_id>[0-9]+)/$', views.miniserver, name='miniserver'),
]
