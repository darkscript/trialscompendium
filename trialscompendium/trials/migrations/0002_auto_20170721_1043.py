# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-07-21 07:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trials', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trialyield',
            name='season',
            field=models.CharField(choices=[('Short Rains', 'Short Rains'), ('Long Rains', 'Long Rains')], max_length=11),
        ),
    ]
