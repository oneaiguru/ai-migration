# app/localizations.py

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from webapp.forms import LocalizationForm
from database.localization_repository import LocalizationRepository
from utils.custom_exceptions import ValidationError

localizations_blueprint = Blueprint('localizations', __name__)
localization_repo = LocalizationRepository()

@localizations_blueprint.route('/')
@login_required
def list_localizations():
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('home'))
    localizations = localization_repo.get_all_localizations(chatbot_id)
    return render_template('localizations/list.html', localizations=localizations, chatbot_id=chatbot_id)

@localizations_blueprint.route('/add', methods=['GET', 'POST'])
@login_required
def add_localization():
    form = LocalizationForm()
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('localizations.list_localizations'))
    if form.validate_on_submit():
        try:
            localization_repo.add_localization_version(
                chatbot_id=chatbot_id,
                key=form.key.data,
                language=form.language.data,
                content=form.content.data
            )
            flash('Localization added successfully.', 'success')
            return redirect(url_for('localizations.list_localizations', chatbot_id=chatbot_id))
        except ValidationError as e:
            flash(str(e), 'danger')
    return render_template('localizations/add.html', form=form, chatbot_id=chatbot_id)

@localizations_blueprint.route('/edit/<int:localization_id>', methods=['GET', 'POST'])
@login_required
def edit_localization(localization_id):
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('localizations.list_localizations'))
    localization = localization_repo.get_localization_by_id(localization_id)
    if not localization:
        flash('Localization not found.', 'danger')
        return redirect(url_for('localizations.list_localizations', chatbot_id=chatbot_id))
    form = LocalizationForm(obj=localization)
    if form.validate_on_submit():
        try:
            localization_repo.add_localization_version(
                chatbot_id=chatbot_id,
                key=form.key.data,
                language=form.language.data,
                content=form.content.data
            )
            flash('Localization updated successfully.', 'success')
            return redirect(url_for('localizations.list_localizations', chatbot_id=chatbot_id))
        except ValidationError as e:
            flash(str(e), 'danger')
    return render_template('localizations/edit.html', form=form, chatbot_id=chatbot_id, localization=localization)

@localizations_blueprint.route('/delete/<int:localization_id>', methods=['POST'])
@login_required
def delete_localization(localization_id):
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('localizations.list_localizations'))
    try:
        localization_repo.delete_localization(localization_id)
        flash('Localization deleted successfully.', 'success')
    except Exception as e:
        flash('Failed to delete localization.', 'danger')
    return redirect(url_for('localizations.list_localizations', chatbot_id=chatbot_id))
