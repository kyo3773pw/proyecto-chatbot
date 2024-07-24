from flask import Blueprint, request, jsonify, render_template, url_for, session, redirect
from models import create_user, validate_user, get_events_by_type

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')
        email = data.get('email')
        nivel_estudio = data.get('nivel_estudio')
        response, status = create_user(name, password, email, nivel_estudio)
        if status == 201:
            session['user'] = name
            return jsonify({"message": "User created successfully", "redirect": url_for('home')}), status
        else:
            return jsonify(response), status
    return render_template('signup.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        response, status = validate_user(email, password)
        if status == 200:
            session['user'] = response.get('name', email)  # Establecer nombre o email en la sesión
            return jsonify({"message": "Login successful", "redirect": url_for('home')}), status
        else:
            return jsonify(response), status
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('auth_bp.login'))

@auth_bp.route('/events/<event_type>', methods=['GET'])
def get_events(event_type):
    events = get_events_by_type(event_type)
    events_list = []
    for event in events:
        event['_id'] = str(event['_id'])  # Convertir ObjectId a string
        events_list.append(event)
    print(f"Eventos obtenidos para {event_type}: {events_list}")  # Añadir este mensaje de depuración
    return render_template('events.html', event_type=event_type, events=events_list)

@auth_bp.route('/test_events/<event_type>', methods=['GET'])
def test_get_events(event_type):
    events = get_events_by_type(event_type)
    events_list = []
    for event in events:
        event['_id'] = str(event['_id'])  # Convertir ObjectId a string
        events_list.append(event)
    print(f"Eventos en formato JSON para {event_type}: {events_list}")  # Añadir este mensaje de depuración
    return jsonify(events_list)  # Devolver como JSON para prueba con Thunder Client
