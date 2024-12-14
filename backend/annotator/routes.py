from flask import Blueprint, request

bp = Blueprint('main', __name__)

@bp.route('/')
def hello():
    return "Sanskrit Manuscript Annotation Tool"

@bp.route('/upload-manuscript', methods=['POST'])
def annotate():
    uploaded_files = request.files
    for file in request.files:
        filename = request.files[file].filename
        request.files[file].save(filename)
    return "", 200

