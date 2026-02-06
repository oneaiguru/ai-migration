# app/prompts.py

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from webapp.forms import PromptForm
from database.prompt_repository import PromptRepository
from utils.custom_exceptions import ValidationError

prompts_blueprint = Blueprint('prompts', __name__)
prompt_repo = PromptRepository()

@prompts_blueprint.route('/')
@login_required
def list_prompts():
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('home'))
    prompts = prompt_repo.get_all_prompts(chatbot_id)
    return render_template('prompts/list.html', prompts=prompts, chatbot_id=chatbot_id)

@prompts_blueprint.route('/add', methods=['GET', 'POST'])
@login_required
def add_prompt():
    form = PromptForm()
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('prompts.list_prompts'))
    if form.validate_on_submit():
        try:
            prompt_repo.add_prompt_version(
                chatbot_id=chatbot_id,
                key=form.key.data,
                gender=form.gender.data,
                content=form.content.data,
                variant=form.variant.data
            )
            flash('Prompt added successfully.', 'success')
            return redirect(url_for('prompts.list_prompts', chatbot_id=chatbot_id))
        except ValidationError as e:
            flash(str(e), 'danger')
    return render_template('prompts/add.html', form=form, chatbot_id=chatbot_id)

@prompts_blueprint.route('/edit/<int:prompt_id>', methods=['GET', 'POST'])
@login_required
def edit_prompt(prompt_id):
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('prompts.list_prompts'))
    prompt = prompt_repo.get_prompt_by_id(prompt_id)
    if not prompt:
        flash('Prompt not found.', 'danger')
        return redirect(url_for('prompts.list_prompts', chatbot_id=chatbot_id))
    form = PromptForm(obj=prompt)
    if form.validate_on_submit():
        try:
            prompt_repo.add_prompt_version(
                chatbot_id=chatbot_id,
                key=form.key.data,
                gender=form.gender.data,
                content=form.content.data,
                variant=form.variant.data
            )
            flash('Prompt updated successfully.', 'success')
            return redirect(url_for('prompts.list_prompts', chatbot_id=chatbot_id))
        except ValidationError as e:
            flash(str(e), 'danger')
    return render_template('prompts/edit.html', form=form, chatbot_id=chatbot_id, prompt=prompt)

@prompts_blueprint.route('/delete/<int:prompt_id>', methods=['POST'])
@login_required
def delete_prompt(prompt_id):
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('prompts.list_prompts'))
    try:
        prompt_repo.delete_prompt(prompt_id)
        flash('Prompt deleted successfully.', 'success')
    except Exception as e:
        flash('Failed to delete prompt.', 'danger')
    return redirect(url_for('prompts.list_prompts', chatbot_id=chatbot_id))
