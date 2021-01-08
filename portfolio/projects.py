from portfolio import app, db, login
from flask import render_template, jsonify, request, url_for, redirect, flash
from flask_login import current_user, login_required

from portfolio.useful import get_fields
from portfolio.models import Project

@app.route('/admin/projects/add', methods=['POST'])
@login_required
def add_project():
    success, data = get_fields(['name', 'small_description', 'description', 'images'], request.form)

    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    project = Project(data['name'], data['small_description'], data['description'], data['images'])
    db.session.add(project)
    current_user.add_project(project)
    db.session.commit()
    app.logger.info('New project created.')
    flash(U"Project has been created.")
    return redirect(url_for('show_backoffice'))


@app.route('/admin/projects/edit/<id>', methods=['GET'])
@login_required
def edit_project(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    project = Project.query.filter(Project.id == id).first()
    if not project:
        flash(u"Can't find this project.", 'error')
        return redirect(url_for('show_backoffice'))
    return render_template('backoffice/edit_project.html', project=project)


@app.route('/admin/projects/edit/<id>', methods=['POST'])
@login_required
def update_project(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    project = Project.query.filter(Project.id == id).first()
    if not project:
        flash(u"Can't find this project.", 'error')
        return redirect(url_for('show_backoffice'))
    success, data = get_fields(['name', 'small_description', 'description', 'images'], request.form)
    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    project.name = data['name']
    project.small_description = data['small_description']
    project.description = data['description']
    project.images = data['images']
    db.session.commit()
    app.logger.info('Project #' + id + ' updated.')
    flash(U'Project #' + id + ' has been updated.')
    return redirect(url_for('show_backoffice'))


@app.route('/admin/projects/delete/<id>', methods=['GET'])
@login_required
def delete_project(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    project = Project.query.filter(Project.id == id).first()
    if not project:
        flash(u"Can't find this project.", 'error')
        return redirect(url_for('show_backoffice'))
    db.session.delete(project)
    db.session.commit()
    app.logger.info('Project #' + id + ' deleted.')
    flash(U'Project #' + id + ' has been deleted.')
    return redirect(url_for('show_backoffice'))