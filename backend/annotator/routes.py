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


#importing GNN libraries
import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.collections as mc
from itertools import combinations
from scipy.spatial import cKDTree
from matplotlib.colors import ListedColormap
cmap = ListedColormap(['grey', 'red'])
from sklearn.cluster import DBSCAN
import cv2
import networkx as nx
from collections import Counter
import random
import matplotlib
import matplotlib.colors as mcolors
import io
import base64



bp = Blueprint("main", __name__)


@bp.route("/")
def hello():
    return "Sanskrit Manuscript Annotation Tool"


@bp.route("/models")
def get_models():
    return os.listdir(os.path.join(current_app.config['DATA_PATH'], 'models', 'recognition'))


@bp.route("/line-images/<string:manuscript_name>/<string:page>/<string:line>")
def serve_line_image(manuscript_name, page, line):
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    return send_from_directory(
        os.path.join(MANUSCRIPTS_PATH, manuscript_name, "lines", page), line + ".jpg"
    )


@bp.route("/upload-manuscript", methods=["POST"])
def annotate():
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    uploaded_files = request.files
    manuscript_name = request.form["manuscript_name"]
    model = request.form["model"]
    folder_path = os.path.join(MANUSCRIPTS_PATH, manuscript_name)
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
    # app_context.push()
    with app_context:
        finetune(data)


@bp.route("/fine-tune", methods=["POST"])
def do_finetune():
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    thread = threading.Thread(
        target=finetune_context, args=(request.json, current_app.app_context())
    )
    thread.start()
    return "Success", 200


@bp.route("/uploaded-manuscripts", methods=["GET"])
def get_manuscripts():
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    return os.listdir(MANUSCRIPTS_PATH)


@bp.route("/recognise", methods=["POST"])
def recognise_manuscript():
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    manuscript_name = request.json.get("manuscript_name")
    model = request.json.get("model")
    print(manuscript_name)
    print(model)
    folder_path = os.path.join(MANUSCRIPTS_PATH, manuscript_name)
    print(folder_path)
    lines = recognise_characters(folder_path, model, manuscript_name)
    print(lines)
    return lines, 200


@bp.route("/segment/<string:manuscript_name>/<string:page>", methods=["GET"])
def get_points(manuscript_name, page):
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    try:
        IMAGE_FILEPATH = os.path.join(
            MANUSCRIPTS_PATH, manuscript_name, "leaves", f"{page}.jpg"
        )
        image = Image.open(IMAGE_FILEPATH)
        width, height = image.size
        response = {"dimensions": [width, height]}
        POINTS_FILEPATH = os.path.join(
            MANUSCRIPTS_PATH, manuscript_name, "points-2D", f"{page}_points.txt"
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
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    segments = request.get_json()
    labels_file = os.path.join(
        MANUSCRIPTS_PATH, manuscript_name, "points-2D", f"{page}_labels.txt"
    )

    with open(labels_file, "w") as f:
        f.write("\n".join(map(str, segments)))

    run_manual_segmentation(manuscript_name, page)

    return {"message": f"succesfully saved labels for page {page}"}, 200







#this gets run, after the points are labelled..(manually or semi-automatically)
@bp.route("/semi-segment/<string:manuscript_name>/<string:page>", methods=["POST"])
def make_semi_segments(manuscript_name, page):
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    segments = request.get_json()
    labels_file = os.path.join(
        MANUSCRIPTS_PATH, manuscript_name, "points-2D", f"{page}_labels.txt"
    )

    print(f"just in semi segmentation {labels_file}")

    # okay so the segments are now being labelled manually, instead we now need to do em semi-manually!!
    # with open(labels_file, "w") as f:
    #     f.write("\n".join(map(str, segments)))

    #run_manual_segmentation(manuscript_name, page)

    return {"message": f"semi segmentation testing for {page}"}, 200



@bp.route("/semi-segment/<manuscript_name>/<page>", methods=["GET"])
def get_points_and_graph(manuscript_name, page):
    MANUSCRIPTS_PATH = os.path.join(current_app.config['DATA_PATH'], 'manuscripts')
    try:
        print("Getting points and generating graph")
        IMAGE_FILEPATH = os.path.join(
            MANUSCRIPTS_PATH, manuscript_name, "leaves", f"{page}.jpg"
        )
        image = Image.open(IMAGE_FILEPATH)
        width, height = image.size
        response = {"dimensions": [width, height]}
        
        # Convert image to base64 for sending in response
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        response["image"] = img_str
        
        POINTS_FILEPATH = os.path.join(
            MANUSCRIPTS_PATH, manuscript_name, "points-2D", f"{page}_points.txt"
        )
        if not os.path.exists(POINTS_FILEPATH):
            return {"error": "Page not found"}, 404
            
        # Load points from file
        with open(POINTS_FILEPATH, "r") as f:
            points_raw = [row.strip().split() for row in f.readlines()]
            
        # Convert to numeric values
        points = [[float(coord) for coord in point] for point in points_raw]
        
        # Apply the layout analysis logic to generate the graph
        graph_data = generate_layout_graph(points)
        response["points"] = points
        response["graph"] = graph_data
        
        return response, 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}, 500

def generate_layout_graph(points):
    """
    Generate a graph representation of text layout based on points.
    This function implements the core layout analysis logic from the notebook.
    """
    NUM_NEIGHBOURS = 8
    cos_similarity_less_than = -0.8
    
    # Build a KD-tree for fast neighbor lookup
    tree = cKDTree(points)
    _, indices = tree.query(points, k=NUM_NEIGHBOURS)
    
    # Store graph edges and their properties
    edges = []
    edge_properties = []
    
    # Process nearest neighbors
    for current_point_index, nbr_indices in enumerate(indices):
        normalized_points = np.array(points)[nbr_indices] - np.array(points)[current_point_index]
        scaling_factor = np.max(np.abs(normalized_points))
        if scaling_factor == 0:
            scaling_factor = 1
        scaled_points = normalized_points / scaling_factor
        
        # Create a list of relative neighbors with their global indices
        relative_neighbours = [
            (global_idx, sp, np) 
            for global_idx, sp, np in zip(nbr_indices, scaled_points, normalized_points)
        ]
        
        filtered_neighbours = []
        for i, neighbor1 in enumerate(relative_neighbours):
            for neighbor2 in relative_neighbours[i+1:]:
                if np.linalg.norm(neighbor1[1]) * np.linalg.norm(neighbor2[1]) == 0:
                    cos_similarity = 0.0
                else:
                    cos_similarity = np.dot(neighbor1[1], neighbor2[1]) / (
                        np.linalg.norm(neighbor1[1]) * np.linalg.norm(neighbor2[1])
                    )
                
                # Calculate non-normalized distances
                norm1 = np.linalg.norm(neighbor1[2])
                norm2 = np.linalg.norm(neighbor2[2])
                total_length = norm1 + norm2
                
                # Select pairs with angles close to 180 degrees (opposite directions)
                if cos_similarity < cos_similarity_less_than:
                    filtered_neighbours.append((neighbor1, neighbor2, total_length, cos_similarity))
        
        if filtered_neighbours:
            # Find the shortest total length pair
            shortest_pair = min(filtered_neighbours, key=lambda x: x[2])
            
            connection_1, connection_2, total_length, cos_similarity = shortest_pair
            global_idx_connection_1 = connection_1[0]
            global_idx_connection_2 = connection_2[0]
            
            # Calculate angles with x-axis
            theta_a = np.degrees(np.arctan2(connection_1[2][1], connection_1[2][0]))
            theta_b = np.degrees(np.arctan2(connection_2[2][1], connection_2[2][0]))
            
            # Add edges to the graph
            edges.append([current_point_index, global_idx_connection_1])
            edges.append([current_point_index, global_idx_connection_2])
            
            # Calculate feature values for clustering
            y_diff1 = abs(connection_1[2][1])  # Vertical distance component
            y_diff2 = abs(connection_2[2][1])
            avg_y_diff = (y_diff1 + y_diff2) / 2
            
            x_diff1 = abs(connection_1[2][0])  # Horizontal distance component
            x_diff2 = abs(connection_2[2][0])
            avg_x_diff = (x_diff1 + x_diff2) / 2
            
            # Calculate aspect ratio (height/width)
            aspect_ratio = avg_y_diff / max(avg_x_diff, 0.001)  # Avoid division by zero
            
            # Calculate vertical alignment consistency
            vert_consistency = abs(y_diff1 - y_diff2)
            
            # Store edge properties for clustering
            edge_properties.append([
                total_length,
                np.abs(theta_a + theta_b),
                aspect_ratio,
                vert_consistency,
                avg_y_diff
            ])
    
    # Cluster the edges based on their properties
    edge_labels = cluster_edges(np.array(edge_properties))
    
    # Prepare the final graph structure
    graph_data = {
        "nodes": [{"id": i, "x": float(point[0]), "y": float(point[1])} for i, point in enumerate(points)],
        "edges": []
    }
    
    # Add edges with their labels
    for i, edge in enumerate(edges):
        # Determine edge label: 0 for correct (majority cluster), -1 for outliers
        edge_label = int(edge_labels[i // 2])  # Divide by 2 because we added each edge pair
        
        graph_data["edges"].append({
            "source": int(edge[0]),
            "target": int(edge[1]),
            "label": edge_label
        })
    
    return graph_data


def cluster_edges(features):
    """
    Cluster edges based on their features using DBSCAN algorithm.
    Returns labels where 0 is the majority cluster and -1 are outliers.
    """
    if len(features) == 0:
        return np.array([])
    
    # Apply DBSCAN clustering
    dbscan = DBSCAN(eps=3, min_samples=2)
    labels = dbscan.fit_predict(features)
    
    # Count occurrences of each label
    label_counts = Counter(labels)
    
    # Find the majority cluster label (excluding -1 outliers)
    majority_label = None
    max_count = 0
    for label, count in label_counts.items():
        if label != -1 and count > max_count:
            majority_label = label
            max_count = count
    
    # Create new labels where majority cluster is 0 and outliers are -1
    new_labels = np.full(len(labels), -1)  # Initialize all as outliers
    
    if majority_label is not None:
        new_labels[labels == majority_label] = 0  # Assign 0 to majority cluster
    
    return new_labels
