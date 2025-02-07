# your-project/backend/server.py
from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS
from manual_segmentation import *

app = Flask(__name__)
CORS(app)

# Configure the data directory relative to the server file
m_name = 'friday'
MANUSCRIPT_DIR = f'/mnt/cai-data/manuscript-annotation-tool/manuscripts/{m_name}'

HEATMAP_DIR = MANUSCRIPT_DIR+'/heatmaps'
IMAGES_DIR = MANUSCRIPT_DIR+'/leaves'
LINES_DIR = MANUSCRIPT_DIR+'/lines'
ANNOT_DIR = MANUSCRIPT_DIR+'/points-2D'


#TODO right now, the tool gets all page images from DATA_DIR, but we actually want one specific page.

@app.route('/api/points/<int:page>', methods=['GET'])
def get_points(page):
    try:
        filename = f"pg_{page}_points.txt"
        filepath = os.path.join(ANNOT_DIR, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Page not found'}), 404
        
        with open(filepath, 'r') as f:
            points = f.read()
            
        return points, 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-labels', methods=['POST'])
def save_labels():
    try:
        data = request.json
        page_num = data.get('page')
        labels = data.get('labels')
        
        if page_num is None or labels is None:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        if not os.path.exists(ANNOT_DIR):
            os.makedirs(ANNOT_DIR)
        
        filename = f"pg_{page_num}_labels.txt"
        filepath = os.path.join(ANNOT_DIR, filename)
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(map(str, labels)))

        #image_filename = f"pg_{page_num}.jpg"
        run_manual_segmentation(page_num)
        
        return jsonify({'message': f'Successfully saved labels for page {page_num}'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def run_manual_segmentation(page_num):
    image_filename = f"pg_{page_num}.jpg"
    image_filenames = [image_filename]
    page_nums = [page_num]

    inp_file_names = [IMAGES_DIR+'/'+image_filename]
    inp_images = [loadImage(inp_file_names[0])]

    heatmap_file_names = [HEATMAP_DIR+'/'+image_filename]
    heatmaps_images = [loadImage(heatmap_file_names[0])]

    
    binarize_threshold=100

    for det,image,file_name,page_num in zip(heatmaps_images,inp_images,image_filenames,page_nums):
        
        filtered_points, filtered_labels = load_points_and_labels(f'{ANNOT_DIR}/pg_{page_num}_points.txt', f'{ANNOT_DIR}/pg_{page_num}_labels.txt')

        # handling loading heatmaps
        det = det.squeeze()  # Removes single-dimensional entries (e.g., (H, W, 1) → (H, W))
        print(det.shape)
        if len(det.shape) == 3:  
            det = det[:, :, 0]  # Keep only one channel
        print(det.shape)

        #print(image.shape) this is x2 scale
        img2 = cv2.cvtColor(cv2.resize(image, det.shape[::-1]), cv2.COLOR_BGR2GRAY) 


        bounding_boxes = gen_bounding_boxes(det, binarize_threshold)
        labeled_bboxes = assign_labels_and_plot(bounding_boxes, filtered_points, filtered_labels, img2, output_path=ANNOT_DIR+'/'+file_name)

        # Sort by the numeric label (5th element)
        # sorted_bboxes = sorted(labeled_bboxes, key=lambda x: x[4])

        # Get unique labels
        unique_labels = set(label for _, _, _, _, label in labeled_bboxes)
        print(unique_labels)
        line_images = gen_line_images(img2,unique_labels,labeled_bboxes)


        page_folder_name = os.path.splitext(file_name)[0]
        #page_folder_name = f'pg_{page_num}'

        if os.path.exists(LINES_DIR+f'/{page_folder_name}') == False:
            os.makedirs(LINES_DIR+f'/{page_folder_name}')
        for i in range(len(line_images)):
            cv2.imwrite(LINES_DIR+f'/{page_folder_name}/line{i+1:03d}.jpg',line_images[i])

if __name__ == '__main__':
    app.run(debug=True, port=5002)