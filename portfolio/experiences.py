from portfolio import app, db, login
from flask import render_template, jsonify, request, url_for, redirect, flash
from flask_login import current_user, login_required

from portfolio.useful import get_fields
from portfolio.models import Experience

@app.route('/admin/experiences/add', methods=['POST'])
@login_required
def add_experience():
    success, data = get_fields(['name', 'description', 'company', 'begin', 'end'], request.form)

    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    experience = Experience(data['name'], data['company'], data['description'], data['begin'], data['end'])
    db.session.add(experience)
    current_user.add_experience(experience)
    db.session.commit()
    app.logger.info('New experience created.')
    flash(U"Experience has been added.")
    return redirect(url_for('show_backoffice'))


@app.route('/admin/experiences/edit/<id>', methods=['GET'])
@login_required
def edit_experience(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    experience = Experience.query.filter(Experience.id == id).first()
    if not experience:
        flash(u"Can't find this experience.", 'error')
        return redirect(url_for('show_backoffice'))
    return render_template('backoffice/edit_experience.html', experience=experience)


@app.route('/admin/experiences/edit/<id>', methods=['POST'])
@login_required
def update_experience(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    experience = Experience.query.filter(Experience.id == id).first()
    if not experience:
        flash(u"Can't find this experience.", 'error')
        return redirect(url_for('show_backoffice'))
    success, data = get_fields(['name', 'company', 'description', 'begin', 'end'], request.form)
    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    experience.name = data['name']
    experience.company = data['company']
    experience.description = data['description']
    experience.begin = data['begin']
    experience.end = data['end']
    db.session.commit()
    app.logger.info('Experience #' + id + ' updated.')
    flash(U'Experience #' + id + ' has been updated.')
    return redirect(url_for('show_backoffice'))


@app.route('/admin/experiences/delete/<id>', methods=['GET'])
@login_required
def delete_experience(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    experience = Experience.query.filter(Experience.id == id).first()
    if not experience:
        flash(u"Can't find this experience.", 'error')
        return redirect(url_for('show_backoffice'))
    db.session.delete(experience)
    db.session.commit()
    app.logger.info('Experience #' + id + ' deleted.')
    flash(U'Experience #' + id + ' has been deleted.')
    return redirect(url_for('show_backoffice'))