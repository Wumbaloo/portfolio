from portfolio import db, login, app
from datetime import datetime
from flask_login import UserMixin

rel_user_project = db.Table(
    'user_project',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete="CASCADE")),
    db.Column('project_id', db.Integer, db.ForeignKey('project.id', ondelete="CASCADE"))
)

rel_user_skill = db.Table(
    'user_skill',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete="CASCADE")),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id', ondelete="CASCADE"))
)


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    small_description = db.Column(db.String(255))
    description = db.Column(db.String(1024))
    images = db.Column(db.String(255))

    def __init__(self, name, small_description, description, images):
        self.name = name
        self.small_description = small_description
        self.description = description
        self.images = images

    def __repr__(self):
        return f"<Project {self.name}>"


class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    level = db.Column(db.String(255))
    description = db.Column(db.String(255))

    def __init__(self, name, level, description):
        self.name = name
        self.level = level
        self.description = description

    def __repr__(self):
        return f"<Skill {self.name}>"


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    display_name = db.Column(db.String(255))
    password = db.Column(db.String(64))
    email = db.Column(db.String(255))
    last_login = db.Column(db.DateTime)
    is_admin = db.Column(db.Boolean, default=False)
    description = db.Column(db.String(1024), default="No description about this user.")
    projects = db.relationship('Project', secondary=rel_user_project, backref="users")
    skills = db.relationship('Skill', secondary=rel_user_skill, backref="users")

    def __init__(self, name, display_name, password, email, is_admin):
        self.name = name
        self.display_name = display_name
        self.password = password
        self.email = email
        self.is_admin = is_admin

    def __repr__(self):
        return f"<User {self.name}>"

    def add_project(self, project):
        if project not in self.projects:
            self.projects.append(project)
            return True
        else:
            self.projects.remove(widget)
            return False

    def add_skill(self, skill):
        if skill not in self.skills:
            self.skills.append(skill)
            return True
        else:
            self.skills.remove(skill)
            return False

    @login.user_loader
    def load_user(id):
        try:
            return User.query.get((int(id)))
        except Exception as e:
            app.logger.error(e)
            return None
        return User.query.get((int(id)))


db.create_all()
