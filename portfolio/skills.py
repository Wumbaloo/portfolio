from portfolio import app, db, login
from flask import render_template, jsonify, request, url_for, redirect, flash
from flask_login import current_user, login_required

from portfolio.useful import get_fields
from portfolio.models import Skill

@app.route('/admin/skills/add', methods=['POST'])
@login_required
def add_skill():
    success, data = get_fields(['name', 'level', 'description'], request.form)

    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    skill = Skill(data['name'], data['level'], data['description'])
    db.session.add(skill)
    current_user.add_skill(skill)
    db.session.commit()
    app.logger.info('New skill created.')
    flash(U"Skill has been added.")
    return redirect(url_for('show_backoffice'))


@app.route('/admin/skills/edit/<id>', methods=['GET'])
@login_required
def edit_skill(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    skill = Skill.query.filter(Skill.id == id).first()
    if not skill:
        flash(u"Can't find this skill.", 'error')
        return redirect(url_for('show_backoffice'))
    return render_template('backoffice/edit_skill.html', skill=skill)


@app.route('/admin/skills/edit/<id>', methods=['POST'])
@login_required
def update_skill(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    skill = Skill.query.filter(Skill.id == id).first()
    if not skill:
        flash(u"Can't find this skill.", 'error')
        return redirect(url_for('show_backoffice'))
    success, data = get_fields(['name', 'level', 'description'], request.form)
    if not success:
        flash(u"Missing fields: [" + data + "]", 'error')
        return redirect(url_for('show_backoffice'))
    skill.name = data['name']
    skill.level = data['level']
    skill.description = data['description']
    db.session.commit()
    app.logger.info('Skill #' + id + ' updated.')
    flash(U'Skill #' + id + ' has been updated.')
    return redirect(url_for('show_backoffice'))


@app.route('/admin/skills/delete/<id>', methods=['GET'])
@login_required
def delete_skill(id):
    if not current_user.is_admin:
        flash(u"You're not an admin.", 'error')
        return redirect(url_for('show_index'))
    skill = Skill.query.filter(Skill.id == id).first()
    if not skill:
        flash(u"Can't find this skill.", 'error')
        return redirect(url_for('show_backoffice'))
    db.session.delete(skill)
    db.session.commit()
    app.logger.info('Skill #' + id + ' deleted.')
    flash(U'Skill #' + id + ' has been deleted.')
    return redirect(url_for('show_backoffice'))