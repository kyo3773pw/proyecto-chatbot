from pymongo import MongoClient
import bcrypt

# Configuración de la conexión a la base de datos MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['ann']
users_collection = db['users']

def create_user(name, password, email, nivel_estudio):
    if users_collection.find_one({'email': email}):
        return {"error": "Email already exists"}, 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        'name': name,
        'password': hashed_password,
        'email': email,
        'nivel_estudio': nivel_estudio
    }
    users_collection.insert_one(user)
    return {"message": "User created successfully"}, 201

def validate_user(email, password):
    user = users_collection.find_one({'email': email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return {"message": "Login successful"}, 200
    return {"error": "Invalid email or password"}, 401

def get_events_by_type(event_type):
    collection_name = event_type.lower()  # Convertir a minúsculas
    print(f"Accediendo a la colección: {collection_name}")  # Mensaje de depuración
    collection = db[collection_name]
    events = list(collection.find())
    print(f"Eventos en la colección {collection_name}: {events}")  # Añadir este mensaje de depuración
    return events
