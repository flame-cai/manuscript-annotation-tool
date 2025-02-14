import os
import threading

from flask import Blueprint, request, send_from_directory, current_app
from PIL import Image
import torch
import gc

from annotator.segmentation import segment_lines
from annotator.manual_segmentation import run_manual_segmentation
from annotator.recognition.recognition import recognise_characters
from annotator.finetune.finetune import finetune

bp = Blueprint("main", __name__)

BASE_PATH = "/mnt/cai-data/manuscript-annotation-tool/manuscripts"


@bp.route("/")
def hello():
    return "Sanskrit Manuscript Annotation Tool"


@bp.route("/models")
def get_models():
    return os.listdir("/mnt/cai-data/manuscript-annotation-tool/models/recognition")


@bp.route("/line-images/<string:manuscript_name>/<string:page>/<string:line>")
def serve_line_image(manuscript_name, page, line):
    return send_from_directory(
        os.path.join(BASE_PATH, manuscript_name, "lines", page), line + ".jpg"
    )


@bp.route("/upload-manuscript", methods=["POST"])
def annotate():
    uploaded_files = request.files
    manuscript_name = request.form["manuscript_name"]
    model = request.form["model"]
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
    lines = recognise_characters(folder_path, model, manuscript_name)
    torch.cuda.empty_cache()
    gc.collect()
    # find_gpu_tensors()

    return lines, 200


def finetune_context(data, app_context):
    app_context.push()
    finetune(data)


@bp.route("/fine-tune", methods=["POST"])
def do_finetune():
    thread = threading.Thread(
        target=finetune_context, args=(request.json, current_app.app_context())
    )
    thread.start()
    # finetune(request.json)
    return "Success", 200


@bp.route("/uploaded-manuscripts", methods=["GET"])
def get_manuscripts():
    return os.listdir("/mnt/cai-data/manuscript-annotation-tool/manuscripts")


@bp.route("/recognise", methods=["POST"])
def recognise_manuscript():
    manuscript_name = request.json.get("manuscript_name")
    model = request.json.get("model")
    print(manuscript_name)
    print(model)
    folder_path = os.path.join(BASE_PATH, manuscript_name)
    print(folder_path)
    lines = recognise_characters(folder_path, model, manuscript_name)
    print(lines)
    return lines, 200


@bp.route("/segment/<string:manuscript_name>/<string:page>", methods=["GET"])
def get_points(manuscript_name, page):
    try:
        IMAGE_FILEPATH = os.path.join(
            BASE_PATH, manuscript_name, "leaves", f"{page}.jpg"
        )
        image = Image.open(IMAGE_FILEPATH)
        width, height = image.size
        response = {"dimensions": [width, height]}
        POINTS_FILEPATH = os.path.join(
            BASE_PATH, manuscript_name, "points-2D", f"{page}_points.txt"
        )
        if not os.path.exists(POINTS_FILEPATH):
            return {"error": "Page not found"}, 404
        with open(POINTS_FILEPATH, "r") as f:
            points = [row.split() for row in f.readlines()]
        response["points"] = points
        return response, 200

    except Exception as e:
        return {"error": str(e)}, 500


@bp.route("/segment/<string:manuscript_name>/<string:page>", methods=["POST"])
def make_segments(manuscript_name, page):
    segments = request.get_json()
    labels_file = os.path.join(
        BASE_PATH, manuscript_name, "points-2D", f"{page}_labels.txt"
    )

    with open(labels_file, "w") as f:
        f.write("\n".join(map(str, segments)))

    run_manual_segmentation(manuscript_name, page)

    return {"message": f"succesfully saved labels for page {page}"}, 200
