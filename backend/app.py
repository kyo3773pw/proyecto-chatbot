import os
from flask import Flask, render_template, session, redirect, url_for
from flask_cors import CORS
from controllers import auth_bp
from models import get_events_by_type

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
CORS(app)
app.secret_key = 'vgZEPfDDQJLB+3^' # Sustituye esto por la clave generada

app.register_blueprint(auth_bp, url_prefix='/auth')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return redirect(url_for('auth_bp.login'))

@app.route('/signup')
def signup():
    return redirect(url_for('auth_bp.signup'))

@app.route('/events/<event_type>')
def events(event_type):
    events = get_events_by_type(event_type)
    events_list = []
    for event in events:
        event['_id'] = str(event['_id'])  # Convertir ObjectId a string
        events_list.append(event)
    return render_template('events.html', event_type=event_type, events=events_list)

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)



