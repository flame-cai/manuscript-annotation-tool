import os

from flask import Blueprint, request

from annotator.segmentation import segment_lines
from annotator.recognition.recognition import recognise_characters

bp = Blueprint("main", __name__)


@bp.route("/")
def hello():
    return "Sanskrit Manuscript Annotation Tool"

@bp.route("/upload-manuscript", methods=["POST"])
def annotate():
    uploaded_files = request.files
    manuscript_name = request.form["manuscript_name"]

    BASE_PATH = "/mnt/cai-data/manuscript-annotation-tool/manuscripts"
    folder_path = os.path.join(BASE_PATH, manuscript_name)
    leaves_folder_path = os.path.join(folder_path, "leaves")

    try:
        os.makedirs(leaves_folder_path, exist_ok=True)
    except Exception as e:
        print(f"An error occured: {e}")

    for file in request.files:
        filename = request.files[file].filename
        request.files[file].save(os.path.join(leaves_folder_path, filename))

    segment_lines(os.path.join(folder_path, "leaves"))
    lines = recognise_characters(folder_path)

    return lines, 200
