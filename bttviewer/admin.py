from django.contrib import admin

from .models import BooleanObject
from .models import Valve3WaysObject
from .models import AnalogObject
from .models import AnalogFlagObject
from .models import MiniServer
from .models import Plane

admin.site.register(MiniServer)
admin.site.register(Plane)
admin.site.register(BooleanObject)
admin.site.register(Valve3WaysObject)
admin.site.register(AnalogObject)
admin.site.register(AnalogFlagObject)

