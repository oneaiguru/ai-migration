import unittest
from flask import url_for
from app.app import app, db
from app.auth import User
from database.models import Author
from werkzeug.security import generate_password_hash

class TestAuth(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register(self):
        response = self.client.post('/register', data={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword',
            'confirm_password': 'testpassword'
        }, follow_redirects=True)
        self.assertIn(b'Registration successful', response.data)

    def test_login(self):
        with app.app_context():
            author = Author(username='testuser', email='test@example.com', password_hash=generate_password_hash('testpassword'))
            db.session.add(author)
            db.session.commit()

        response = self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'testpassword'
        }, follow_redirects=True)
        self.assertIn(b'Logged in successfully', response.data)

    def test_logout(self):
        with app.app_context():
            author = Author(username='testuser', email='test@example.com', password_hash=generate_password_hash('testpassword'))
            db.session.add(author)
            db.session.commit()

        self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        response = self.client.get('/logout', follow_redirects=True)
        self.assertIn(b'Logged out successfully', response.data)

if __name__ == '__main__':
    unittest.main()
