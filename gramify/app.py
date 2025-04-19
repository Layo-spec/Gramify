from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Add this line
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app) 

# 🗂 Directory to store avatars
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🎯 Allowed file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 📤 Avatar Upload Route
@app.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Save the file
        file.save(filepath)

        # Return the URL to use in frontend
        return jsonify({'url': f'/static/uploads/{filename}'})
    else:
        return jsonify({'error': 'Invalid file type'}), 400

# ✅ Root route (optional — just for testing)
@app.route('/')
def index():
    return "✅ Flask Avatar Upload API is running!"

# 🔁 Run the Flask app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)

