from portfolio import app, db, login
from flask import render_template, jsonify, request, url_for, redirect, flash
from flask_login import current_user, login_user, login_required
from datetime import datetime
from hashlib import sha256
from math import floor
import time
import requests
import psycopg2

from portfolio.models import User
from portfolio.projects import add_project, edit_project, delete_project
from portfolio.skills import add_skill, edit_skill, delete_skill

@app.errorhandler(404)
def not_found(e):
    return render_template("page-not-found.html")


@login.unauthorized_handler
def unauthorized():
    return redirect(url_for('show_index'))


@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.now()
        db.session.commit()


@app.route('/')
def show_index():
    user = User.query.first()
    return render_template('index.html', user=user)


def login_user_request(request):
    success, data = get_fields(['name', 'password', 'rememberme'], request.form)

    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    password = sha256(data['password'].encode('utf-8')).hexdigest()
    user = User.query.filter(((User.name == data['name'].lower()) | (User.display_name == data['name'])) & (User.password == password)).first()
    if not user:
        flash(u'No account found with theses credentials', 'error')
        return redirect(url_for('show_backoffice'))
    login_user(user, remember=data['rememberme'])
    user.last_login = datetime.utcnow()
    db.session.commit()
    return redirect(url_for('show_backoffice'))


@app.route('/admin', methods=['GET', 'POST'])
def show_backoffice():
    if current_user.is_authenticated:
        return render_template('backoffice/index.html')
    elif request.method== 'GET':
        return render_template('backoffice/login.html')
    return login_user_request(request)


@app.route('/admin/edit', methods=['POST'])
@login_required
def edit_portfolio():
    success, data = get_fields(['display_name', 'password', 'email', 'description'], request.form)

    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    current_user.name = data['name']
    current_user.password = sha256(data['password'].encode('utf-8')).hexdigest()
    current_user.email = data['email']
    current_user.description = data['description']
    db.session.commit()
    app.logger.info('User #' + current_user.id + ' updated.')
    flash(U"Successfully updated.")
    return redirect(url_for('show_backoffice'))