from portfolio import app, db, login
from flask import render_template, jsonify, request, url_for, redirect
from flask_login import current_user, login_required
from datetime import datetime
from math import floor
import time
import requests
import psycopg2

@app.errorhandler(404)
def not_found(e):
    return render_template("page-not-found.html")


@login.unauthorized_handler
def unauthorized():
    return redirect(url_for('showIndex'))


@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.now()
        db.session.commit()


@app.route('/')
def showIndex():
    return render_template('index.html')
