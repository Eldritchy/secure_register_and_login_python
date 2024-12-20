"""
**ABOUT THIS FILE**

auth/routes_account.py contains routes responsible for account management functionalities related to authentication.
Here you will find the following routes:
- **change_user_name** route
- **change_email** route #TODO
- **change_password** route #TODO
- **reset_password** route #TODO

The format of data sent by the client is validated using Json Schema. 
Reoutes receiving client data are decorated with `@validate_schema(name_of_schema)` for this purpose. 

------------------------
## More information

This app relies on Flask-Login (see `app/extensions`) to handle authentication. It provides user session management, allowing us to track user logins, manage sessions, and protect routes.

Checkout the docs for more information about how Flask-Login works: https://flask-login.readthedocs.io/en/latest/#configuring-your-application

"""
import logging
from flask import Blueprint, request, jsonify, session
from flask_login import login_user as flask_login_user, current_user, logout_user as flask_logout_user, login_required
from datetime import datetime, timezone
from app.extensions.extensions import flask_bcrypt, db, limiter, login_manager
from app.models.user import User
from app.utils.custom_decorators.json_schema_validator import validate_schema
from app.utils.salt_and_pepper.helpers import generate_salt, get_pepper
from app.utils.log_event_utils.log import log_event
from app.utils.detect_html.detect_html import check_for_html
from app.utils.profanity_check.profanity_check import has_profanity
from app.utils.ip_utils.ip_address_validation import get_client_ip
from app.utils.ip_utils.ip_geolocation import geolocate_ip 
from app.utils.ip_utils.ip_anonymization import anonymize_ip
from app.utils.bot_detection.bot_detection import bot_caught
from app.routes.auth.schemas import change_name_schema, auth_change_req_schema
from app.routes.auth.helpers import is_good_password
from . import auth

# CHAGE USER'S NAME
@auth.route("/change_user_name", methods=["POST"])
@login_required
@validate_schema(change_name_schema)
@limiter.limit("10/day")
def change_user_name(): # TODO --> Add to logs so user actions can show in history
    """
    change_user_name() -> JsonType
    ----------------------------------------------------------

    Route changes the name associated with the user's account. 
    
    Returns Json object containing strings:
    - "response" value is always included.  
    - "user" value only included if response is "success".

    ----------------------------------------------------------
    **Response example:**

    ```python
        response_data = {
                "response":"success",
                "user": {
                    "name": "John", 
                    "email": "john@email.com",
                    "access": "user"
                    }, 
            }
    ``` 
    """
    # Standard error response
    error_response = {"response": "There was an error changing user's name."}

    # Get the JSON data from the request body
    json_data = request.get_json()
    new_name = json_data["new_name"]

    the_user = User.query.filter_by(email=current_user.email).first()
    old_name = the_user.name

    try:
        the_user.name = new_name
        db.session.commit()
        logging.info(f"User {current_user.email} name changed from {old_name} to {new_name}.")
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"User could not change name. Error: {e}")
        return jsonify(error_response), 500

    flag = False

    html_in_name = check_for_html(new_name, "auth - change_user_name", current_user.email)
    if html_in_name:
        flag = "YELLOW"
        the_user.flag_change(flag)
    else:
        profanity_in_name = has_profanity(new_name) 
        if profanity_in_name:
            flag = "PURPLE"
            the_user.flag_change(flag)
    
    if flag:
            the_user.flag_change(flag)
            db.session.commit()

    response_data ={
            "response":"success",
            "user": {
                "access": the_user.access_level.value, 
                "name": the_user.name, 
                "email": the_user.email},
        }
    return jsonify(response_data)

# REQUEST TO CHAGE USER'S  EMAIL OR PASSWORD (STEP 1)
@auth.route("/request_auth_change", methods=["POST"])
@login_required
@validate_schema(auth_change_req_schema)
@limiter.limit("10/day")
def change_user_email(): # TODO --> Add to logs so user actions can show in history
    """
    change_user_email() -> JsonType
    ----------------------------------------------------------

    Route changes the email associated with the user's account. 
    
    Returns Json object containing strings:
    - "response" value is always included.  
    - "user" value only included if response is "success".

    ----------------------------------------------------------
    **Response example:**

    ```python
        response_data = {
                "response":"success",
                "user": {
                    "name": "John", 
                    "email": "john@email.com",
                    "access": "user"
                    }, 
            }
    ``` 
    """
    # Standard error response
    error_response = {"response": "There was an error changing user's email."}

    # Get the JSON data from the request body
    json_data = request.get_json()
    change_request_type = json_data["type"]

    the_user = User.query.filter_by(email=current_user.email).first()
    old_email = the_user.email

    # Create a secret key TODO

    # Send secret key by email TODO

    # Log this event TODO

    

    response_data ={
            "response":"success",
            "user": {
                "access": the_user.access_level.value, 
                "name": the_user.name, 
                "email": the_user.email},
        }
    return jsonify(response_data)