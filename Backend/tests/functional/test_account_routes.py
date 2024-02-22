import json
from datetime import datetime, timezone
from flask_login import  current_user
from app.extensions import flask_bcrypt, db, limiter, login_manager
from app.models.user import User
from app.utils.salt_and_pepper.helpers import generate_salt, get_pepper
from app.utils.constants.enum_class import modelBool, UserAccessLevel, UserFlag

def test_signup_user(client, app_test):
    """
    GIVEN a JSON object with name, email, and password
    CHECK user registration and response status
    """
    data = {"name": "Test Joe", "email": "test@apptest.com", "password": "joeTesting067!", "honeypot": ""}
    data_error = {"name": "Test Joe", "email": "test@apptest.com", "password": "joeTesting067!", "honeypot": "hello honey"}
    
    with app_test.app_context():
        response_1 = client.post("/api/account/signup", json=data)

        # Check response has the status 200 and user was created
        assert response_1.status_code == 200
        user = User.query.filter_by(email=data["email"]).first()
        assert user.name == "Test Joe"

        # Check response data
        response_data = json.loads(response_1.data)
        assert response_data["response"] == "success"
        assert "user" in response_data
        assert response_data["user"]["name"] == "Test Joe"
        assert response_data["user"]["email"] == "test@apptest.com"
        assert response_data["user"]["access"] == UserAccessLevel.USER.value

        # Check that the user cannot register again
        response_2 = client.post("/api/account/signup", json=data)
        assert response_2.status_code == 400

def test_login_user(client, app_test):
    """
    GIVEN a JSON object with email, and password
    CHECK user login and response status
    """
    user_name = "John Test"
    user_email = "test@apptest.com"
    user_password = "joeTesting067!"

    date = datetime.now(timezone.utc)
    salt = generate_salt()
    pepper = get_pepper(date)
    salted_password = salt + user_password + pepper
    hashed_password = flask_bcrypt.generate_password_hash(salted_password).decode("utf-8")
    
    with app_test.app_context():
        # Create user
        new_user = User(name=user_name, email=user_email, password=hashed_password, salt=salt, created_at=date)
        db.session.add(new_user)
        db.session.commit()

        # Test 1: valid data
        data = {"email": user_email, "password": user_password, "honeypot": ""}
        response_1 = client.post("/api/account/login", json=data)
        assert response_1.status_code == 200
        response_data = json.loads(response_1.data)
        assert response_data["response"] == "success"
        assert "user" in response_data
        assert response_data["user"]["access"] == "user"
        assert response_data["user"]["name"] == user_name
        assert response_data["user"]["email"] == user_email

        # Test 2: honeypot error
        data_error_1 = {"email": user_email, "password": user_password, "honeypot": "hello honey"}
        response_2 = client.post("/api/account/login", json=data_error_1)
        assert response_2.status_code == 418
        response_data_error_1 = json.loads(response_2.data)
        assert response_data_error_1["response"] == "There was an error logging in user."

        # Test 3: invalid data
        data_error_2 = {"email": user_email, "password": "hello this world error", "honeypot": ""}
        response_3 = client.post("/api/account/login", json=data_error_2)
        assert response_3.status_code == 401
        response_data_error_2 = json.loads(response_3.data)
        assert response_data_error_2["response"] == "There was an error logging in user."