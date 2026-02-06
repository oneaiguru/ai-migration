import unittest
from flask import url_for
from app.app import app, db
from database.models import Author, Chatbot, PromptVersion
from database.prompt_repository import PromptRepository
from werkzeug.security import generate_password_hash

class TestPrompts(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            author = Author(username='testuser', email='test@example.com', password_hash=generate_password_hash('testpassword'))
            db.session.add(author)
            db.session.commit()
            chatbot = Chatbot(author_id=author.id, name='TestBot', telegram_token='test_token')
            db.session.add(chatbot)
            db.session.commit()
            self.chatbot_id = chatbot.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_add_prompt(self):
        self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        response = self.client.post(f'/prompts/add?chatbot_id={self.chatbot_id}', data={
            'key': 'test_prompt',
            'gender': 'Мужчина',
            'variant': 'control',
            'content': 'Test prompt content'
        }, follow_redirects=True)
        self.assertIn(b'Prompt added successfully', response.data)

    def test_edit_prompt(self):
        prompt_repo = PromptRepository()
        with app.app_context():
            prompt = prompt_repo.add_prompt_version(self.chatbot_id, 'test_prompt', 'Мужчина', 'Initial content')
            db.session.commit()

        self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        response = self.client.post(f'/prompts/edit/{prompt.id}?chatbot_id={self.chatbot_id}', data={
            'key': 'test_prompt',
            'gender': 'Мужчина',
            'variant': 'control',
            'content': 'Updated content'
        }, follow_redirects=True)
        self.assertIn(b'Prompt updated successfully', response.data)

    def test_delete_prompt(self):
        prompt_repo = PromptRepository()
        with app.app_context():
            prompt = prompt_repo.add_prompt_version(self.chatbot_id, 'test_prompt', 'Мужчина', 'Test content')
            db.session.commit()

        self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        response = self.client.post(f'/prompts/delete/{prompt.id}?chatbot_id={self.chatbot_id}', follow_redirects=True)
        self.assertIn(b'Prompt deleted successfully', response.data)

if __name__ == '__main__':
    unittest.main()
