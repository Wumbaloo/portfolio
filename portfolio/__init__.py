import redis
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from hashlib import sha256
import requests
from os import environ

app = Flask(__name__)
app.config['SECRET_KEY'] = "b'\x7f\x99\xc5\xed*vj\x08M\xab\xfe\xab`f\xc8\xce'"
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://admin:admin@database:5432/portfolio"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login = LoginManager()
login.init_app(app)
cache = redis.Redis(host='redis', port=6379)
session = requests.Session()

import portfolio.views
import portfolio.models

from portfolio.models import User

# Create admin user
users = User.query.all()
found = False
for user in users:
    if (user.name == "admin"):
        found = True
if not found:
    password = sha256("pwz9)!M7".encode('utf-8')).hexdigest()
    admin = User("admin", "William Gaudfrin", password, "william.gaudfrin@epitech.eu", True)
    admin.description = 'Étudiant en 3ème année d\'informatique à <span style="color: #0069B2; font-weight: bold;">{EPITECH.}</span> Lille'
    db.session.add(admin)
    db.session.commit()
    app.logger.info("Admin account created.")