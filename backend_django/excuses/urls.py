# excuses/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.excuse_list, name='excuse_list'),
    path('<int:excuse_id>/', views.excuse_detail, name='excuse_detail'),
    path('<int:excuse_id>/review/', views.review_excuse, name='review_excuse'),
]