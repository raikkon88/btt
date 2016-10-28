from django.conf.urls import url
from . import views
from . import ws

urlpatterns = [
    url(r'^login/', views.user_login, name='login'),
    url(r'^$', views.user_login, name='login'),
    url(r'^logout/', views.user_logout, name='logout'),
    url(r'^home/', views.home, name='home'),
    url(r'^miniserver/(?P<miniserver_id>[0-9]+)/$', views.miniserver, name='miniserver'),
    url(r'^plane/(?P<plane_id>[0-9]+)/$', views.plane, name='plane'),
    url(r'^reload/(?P<object_id>[\w-]+)/$', views.reloadQuery, name='reloadQuery'),
    url(r'^result/(?P<object_id>[0-9]+)/$', views.request_value, name='request_value'),
    url(r'^ws/processobjects/', ws.ProcessJsonObjects, name='ProcessJsonObjects'),

]
