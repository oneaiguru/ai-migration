from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from config.settings import DATABASE_URL
from webapp.auth import auth_blueprint
from webapp.prompts import prompts_blueprint
from webapp.localizations import localizations_blueprint
from webapp.ab_testing import ab_testing_blueprint
from app.ab_test_routes import ab_test_blueprint


app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Register Blueprints
app.register_blueprint(auth_blueprint)
app.register_blueprint(prompts_blueprint, url_prefix='/prompts')
app.register_blueprint(localizations_blueprint, url_prefix='/localizations')
app.register_blueprint(ab_testing_blueprint, url_prefix='/ab_testing')

app.register_blueprint(ab_test_blueprint, url_prefix='/ab-test')
# Home Route
@app.route('/')
def home():
    return "Welcome to the Chatbot Authoring Interface!"

if __name__ == "__main__":
    app.run(debug=True)
