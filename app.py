from flask import Flask, render_template, request, jsonify, abort
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def init_db():
    conn = sqlite3.connect('photos.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY, 
            filename TEXT, 
            timestamp TEXT, 
            email TEXT,
            name TEXT
        )
    ''')
    conn.close()

@app.route('/')
def gallery_page():
    return render_template('gallery.html')

@app.route('/api/photos')
def get_photos():
    conn = sqlite3.connect('photos.db')
    cursor = conn.execute('SELECT filename, email, name FROM photos ORDER BY id DESC')
    photos = [{
        'filename': row[0], 
        'email': row[1] if row[1] else '',
        'name': row[2] if row[2] else ''
    } for row in cursor.fetchall()]
    conn.close()
    return jsonify(photos)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'photo' not in request.files:
            return 'No file part', 400
        
        file = request.files['photo']
        email = request.form.get('email', '').strip()
        name = request.form.get('name', '').strip()

        if file.filename == '':
            return 'No selected file', 400
        if not email:
            return 'Email is required', 400
        if not name:
            return 'Name is required', 400
            
        if file:
            now = datetime.now()
            timestamp_str = now.strftime('%Y%m%d%H%M%S')
            filename = f"{timestamp_str}_{file.filename}"
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            conn = sqlite3.connect('photos.db')
            conn.execute('INSERT INTO photos (filename, timestamp, email, name) VALUES (?, ?, ?, ?)', 
                         (filename, now.strftime('%Y-%m-%d %H:%M:%S'), email, name))
            conn.commit()
            conn.close()
            
            return 'Success', 200
            
    return render_template('upload.html')

@app.route('/api/delete-photo', methods=['POST'])
def delete_photo():
    data = request.get_json()
    if not data or 'filename' not in data or 'email' not in data:
        return 'Missing data', 400
        
    filename = data['filename']
    email = data['email'].strip()
    
    conn = sqlite3.connect('photos.db')
    cursor = conn.execute('SELECT email FROM photos WHERE filename = ?', (filename,))
    row = cursor.fetchone()
    
    if row is None:
        conn.close()
        return 'Photo not found', 404
        
    db_email = row[0]
    
    if db_email and db_email.lower() == email.lower():
        conn.execute('DELETE FROM photos WHERE filename = ?', (filename,))
        conn.commit()
        conn.close()
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return 'Deleted successfully', 200
    else:
        conn.close()
        return 'Unauthorized', 403

from waitress import serve

if __name__ == '__main__':
    init_db()
    serve(app, host='0.0.0.0', port=8000, threads=8)