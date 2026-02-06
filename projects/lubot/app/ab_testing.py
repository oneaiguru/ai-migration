from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from webapp.forms import ABTestForm
from database.ab_test_repository import ABTestRepository
from utils.custom_exceptions import ValidationError

ab_testing_blueprint = Blueprint('ab_testing', __name__)
ab_test_repo = ABTestRepository()

@ab_testing_blueprint.route('/')
@login_required
def list_ab_tests():
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('home'))
    ab_tests = ab_test_repo.get_all_ab_tests(chatbot_id)
    return render_template('ab_testing/list.html', ab_tests=ab_tests, chatbot_id=chatbot_id)

@ab_testing_blueprint.route('/add', methods=['GET', 'POST'])
@login_required
def add_ab_test():
    form = ABTestForm()
    chatbot_id = request.args.get('chatbot_id', type=int)
    if not chatbot_id:
        flash('Chatbot ID is required.', 'warning')
        return redirect(url_for('ab_testing.list_ab_tests'))
    if form.validate_on_submit():
        try:
            ab_test_repo.add_ab_test(
                chatbot_id=chatbot_id,
                test_name=form.test_name.data,
                variant_name=form.variant_name.data,
                description=form.description.data
            )
            flash('A/B test variant added successfully.', 'success')
            return redirect(url_for('ab_testing.list_ab_tests', chatbot_id=chatbot_id))
        except ValidationError as e:
            flash(str(e), 'danger')
    return render_template('ab_testing/add.html', form=form, chatbot_id=chatbot_id)

# Add edit and delete routes similar to prompts and localizations
