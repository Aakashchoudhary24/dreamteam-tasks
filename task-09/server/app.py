from flask import Flask, jsonify, request, make_response
import psycopg2
import psycopg2.extras
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
from credentials import DB_PASSWORD, DB_NAME, DB_USERNAME, SECRET_KEY

app = Flask(__name__)

app.config['DB_NAME'] = DB_NAME
app.config['DB_USER'] = DB_USERNAME
app.config['DB_PASSWORD'] = DB_PASSWORD
app.config['DB_HOST'] = 'localhost'
app.config['DB_PORT'] = 5432
app.config['JWT_SECRET_KEY'] = SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

jwt = JWTManager(app)
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}})

def connect_db():
    try:
        conn = psycopg2.connect(
            host=app.config['DB_HOST'],
            database=app.config['DB_NAME'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD']
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data.get('username')
    password = data.get('password')
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        conn = connect_db()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO users(username, password) VALUES (%s, %s) RETURNING id;", (username, hashed_password))
            user_id = cursor.fetchone()[0]
            conn.commit()

        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = connect_db()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, password FROM users WHERE username = %s;", (username,))
            user = cursor.fetchone()
            if not user or not check_password_hash(user[1], password):
                return jsonify({"error": "Invalid username or password"}), 401

        access_token = create_access_token(identity=str(user[0]))
        return jsonify({
            "message": "Login successful", 
            "access_token": access_token
        }), 200

    except Exception as e:
        return jsonify({"error": "Login failed", "details": str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        
        conn = connect_db()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        with conn.cursor() as cursor:
            cursor.execute("SELECT username FROM users WHERE id = %s;", (user_id,))
            user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": {"username": user[0]}}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch profile", "details": str(e)}), 500

@app.route('/api/tasks', methods=['GET', 'POST'])
@jwt_required()
def handle_tasks():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        try:
            conn = connect_db()
            if conn is None:
                return jsonify({"error": "Database connection failed"}), 500

            with conn.cursor() as cursor:
                cursor.execute("SELECT id, description, status, created_at FROM tasks WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
                tasks = cursor.fetchall()
                tasks_list = [{"id": task[0], "description": task[1], "status": task[2], "created_at": task[3]} for task in tasks]
                return jsonify({"tasks": tasks_list}), 200

        except Exception as e:
            return jsonify({"error": "Failed to fetch tasks", "details": str(e)}), 500

    elif request.method == 'POST':
        data = request.get_json()
        description = data.get('description')
        status = data.get('status', 'Pending')

        if not description:
            return jsonify({"error": "Task description is required"}), 400

        try:
            conn = connect_db()
            if conn is None:
                return jsonify({"error": "Database connection failed"}), 500

            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO tasks (user_id, description, status, created_at) VALUES (%s, %s, %s, NOW()) RETURNING id, description, status, created_at", 
                    (user_id, description, status)
                )
                task = cursor.fetchone()
                conn.commit()

            if not task:
                return jsonify({"error": "Failed to create task"}), 500

            return jsonify({"task": {"id": task[0], "description": task[1], "status": task[2], "created_at": task[3]}}), 201

        except Exception as e:
            return jsonify({"error": "Failed to create task", "details": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_task(task_id):
    user_id = get_jwt_identity()

    if request.method == 'PUT':
        data = request.get_json()
        status = data.get('status')

        if not status:
            return jsonify({"error": "Status is required"}), 400

        try:
            conn = connect_db()
            if conn is None:
                return jsonify({"error": "Database connection failed"}), 500

            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE tasks SET status = %s WHERE id = %s AND user_id = %s RETURNING id, description, status, created_at", 
                    (status, task_id, user_id)
                )
                updated_task = cursor.fetchone()
                conn.commit()

                if not updated_task:
                    return jsonify({"error": "Task not found or unauthorized"}), 404

            return jsonify({"task": {"id": updated_task[0], "description": updated_task[1], "status": updated_task[2], "created_at": updated_task[3]}}), 200

        except Exception as e:
            return jsonify({"error": "Failed to update task", "details": str(e)}), 500

    elif request.method == 'DELETE':
        try:
            conn = connect_db()
            if conn is None:
                return jsonify({"error": "Database connection failed"}), 500

            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM tasks WHERE id = %s AND user_id = %s RETURNING id, description, status, created_at", 
                    (task_id, user_id)
                )
                deleted_task = cursor.fetchone()
                conn.commit()

                if not deleted_task:
                    return jsonify({"error": "Task not found or unauthorized"}), 404

            return jsonify({"message": "Task deleted successfully"}), 200

        except Exception as e:
            return jsonify({"error": "Failed to delete task", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)