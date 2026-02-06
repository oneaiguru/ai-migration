# app/forms.py

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, TextAreaField
from wtforms.validators import DataRequired, Email, EqualTo, Length

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Login')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=50)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[
        DataRequired(), EqualTo('password', message='Passwords must match.')
    ])
    submit = SubmitField('Register')

class PromptForm(FlaskForm):
    key = StringField('Key', validators=[DataRequired(), Length(max=100)])
    gender = SelectField('Gender', choices=[('Мужчина', 'Мужчина'), ('Женщина', 'Женщина'), ('Не хочу указывать', 'Не хочу указывать')], validators=[DataRequired()])
    variant = SelectField('Variant', choices=[('control', 'Control'), ('variant1', 'Variant 1')], validators=[DataRequired()])
    content = TextAreaField('Content', validators=[DataRequired()])
    submit = SubmitField('Save')

class LocalizationForm(FlaskForm):
    key = StringField('Key', validators=[DataRequired(), Length(max=100)])
    language = StringField('Language', validators=[DataRequired(), Length(max=10)])
    content = TextAreaField('Content', validators=[DataRequired()])
    submit = SubmitField('Save')

class ABTestForm(FlaskForm):
    test_name = StringField('Test Name', validators=[DataRequired(), Length(max=100)])
    variant_name = StringField('Variant Name', validators=[DataRequired(), Length(max=50)])
    description = TextAreaField('Description', validators=[DataRequired()])
    submit = SubmitField('Save')
