from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from services.ab_test_service import ABTestService

ab_test_blueprint = Blueprint('ab_test', __name__)
ab_test_service = ABTestService()

@ab_test_blueprint.route('/admin/ab-test-results', methods=['GET'])
@login_required
def ab_test_results():
    chatbot_id = request.args.get('chatbot_id', type=int)
    
    if not chatbot_id:
        return jsonify({'error': 'Chatbot ID is required'}), 400
    
    model_results = ab_test_service.get_test_results(chatbot_id, "response_generation")
    prompt_results = ab_test_service.get_test_results(chatbot_id, "prompt_set")
    
    return render_template('admin/ab_test_results.html', 
                           model_results=model_results, 
                           prompt_results=prompt_results, 
                           chatbot_id=chatbot_id)
