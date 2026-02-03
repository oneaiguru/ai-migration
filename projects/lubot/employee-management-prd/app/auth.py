# app/auth.py

from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_user, logout_user, login_required, current_user
from webapp.forms import LoginForm, RegisterForm
from database.models import Author
from database.author_repository import AuthorRepository
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

auth_blueprint = Blueprint('auth', __name__)
author_repo = AuthorRepository()

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role != role:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

class User(UserMixin):
    def __init__(self, author):
        self.id = author.id
        self.username = author.username
        self.email = author.email
        self.role = author.role  # Add role attribute

@login_manager.user_loader
def load_user(user_id):
    author = author_repo.get_author(int(user_id))
    if author:
        return User(author)
    return None

@auth_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        author = author_repo.get_author_by_email(form.email.data)
        if author and check_password_hash(author.password_hash, form.password.data):
            user = User(author)
            login_user(user)
            flash('Logged in successfully.', 'success')
            return redirect(url_for('home'))
        flash('Invalid email or password.', 'danger')
    return render_template('login.html', form=form)

@auth_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        existing_author = author_repo.get_author_by_email(form.email.data)
        if existing_author:
            flash('Email already registered.', 'warning')
            return redirect(url_for('auth.register'))
        hashed_password = generate_password_hash(form.password.data)
        author = author_repo.create_author(form.username.data, form.email.data, hashed_password, role='author')
        flash('Registration successful. Please log in.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('register.html', form=form)

@auth_blueprint.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('auth.login'))
