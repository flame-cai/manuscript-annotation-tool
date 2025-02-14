import os
import shutil
import numpy as np
import cv2
from skimage import io


def gen_bounding_boxes(det, binarize_threshold):
    img = np.uint8(det)
    _, img1 = cv2.threshold(img, binarize_threshold, 255, cv2.THRESH_BINARY)
    # Find contours
    contours, _ = cv2.findContours(img1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bounding_boxes = []
    # Extract bounding boxes from contours
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        bounding_boxes.append((x, y, w, h))

    return bounding_boxes


def load_points_and_labels(points_file, labels_file):
    # Load points
    points = np.loadtxt(points_file, dtype=int)

    # Load labels, handling 'None' entries
    with open(labels_file, "r") as f:
        labels = [line.strip() for line in f]

    # Convert labels to integers where possible, otherwise mark as None
    filtered_points = []
    filtered_labels = []

    for point, label in zip(points, labels):
        if label.lower() != "none":  # Exclude 'None' labels
            filtered_points.append(point)
            filtered_labels.append(int(label))  # Convert valid labels to int

    return np.array(filtered_points), np.array(filtered_labels)


def load_images_from_folder(folder_path):
    inp_images = []
    file_names = []

    # Get all files in the directory
    files = sorted(os.listdir(folder_path))

    for file in files:
        # Check if the file is an image (PNG or JPG)
        if file.lower().endswith((".png", ".jpg", ".jpeg")):
            try:
                # Construct the full file path
                file_path = os.path.join(folder_path, file)

                # Open the image file
                image = loadImage(file_path)

                # Append the image and filename to our lists
                inp_images.append(image)
                file_names.append(file)
            except Exception as e:
                print(f"Error loading {file}: {str(e)}")

    return inp_images, file_names


# Function Definitions
def loadImage(img_file):
    img = io.imread(img_file)  # RGB order
    print(f"loading image with shape: {img.shape}")
    if img.shape[0] == 2:
        img = img[0]
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    if img.shape[2] == 4:
        img = img[:, :, :3]
    img = np.array(img)

    return img


def assign_labels_and_plot(
    bounding_boxes, points, labels, image, output_path="output.png"
):
    # Convert image to color (if grayscale)
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

    labeled_bboxes = []
    no_entry_again = []
    for bbox in bounding_boxes:
        x_min, y_min, w, h = bbox
        x_max, y_max = x_min + w, y_min + h

        # Find labels of points inside this bounding box
        assigned_label = []
        for (px, py), label in zip(points, labels):
            if x_min <= px <= x_max and y_min <= py <= y_max:
                assigned_label.append(label)  # Assign the first found label
                # break  # Stop checking once a label is assigned

        if len(set(assigned_label)) == 1:  # IF ONLY ONE LABEL PER BOUNDING BOX
            labeled_bboxes.append((x_min, y_min, w, h, assigned_label[0]))
            # Draw bounding box
            cv2.rectangle(
                image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2
            )  # Green box
            cv2.putText(
                image,
                str(assigned_label[0]),
                (x_min, y_min - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )

        # handle tall bounding boxes
        # elif len(set(assigned_label))> 1:
        #     divide_by = len(set(assigned_label))
        #     print(f"dividing by: {divide_by}")
        #     unit = int(h/divide_by)
        #     h = unit
        #     y_start = y_min

        #     for i in range(divide_by):
        #         print(divide_by)
        #         print(f"YOOO:{(x_min,y_start, w, h)}")
        #         if (x_min,y_start,w) not in no_entry_again:
        #             bounding_boxes.append((x_min,y_start, w, h))
        #             no_entry_again.append((x_min,y_start,w))
        #         y_start = y_start + unit
        #         h = h + unit

    # Draw points with labels
    for (px, py), label in zip(points, labels):
        if label is not None:
            cv2.circle(image, (px, py), 5, (0, 0, 255), -1)  # Red point
            cv2.putText(
                image,
                str(label),
                (px + 5, py - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                2,
            )
    # Save image
    cv2.imwrite(output_path, image)
    print(f"Annotated image saved as: {output_path}")

    return labeled_bboxes  # List of (x, y, w, h, label)


def crop_img(img):
    sum_rows = np.sum(img, axis=1)
    sum_cols = np.sum(img, axis=0)

    # Find indices where sum starts to vary for rows
    row_start = (
        np.where(sum_rows != sum_rows[0])[0][0]
        if np.any(sum_rows != sum_rows[0])
        else 0
    )
    row_end = (
        np.where(sum_rows != sum_rows[-1])[0][-1]
        if np.any(sum_rows != sum_rows[-1])
        else len(sum_rows) - 1
    )

    # Find indices where sum starts to vary for columns
    col_start = (
        np.where(sum_cols != sum_cols[0])[0][0]
        if np.any(sum_cols != sum_cols[0])
        else 0
    )
    col_end = (
        np.where(sum_cols != sum_cols[-1])[0][-1]
        if np.any(sum_cols != sum_cols[-1])
        else len(sum_cols) - 1
    )

    # Crop the image using the identified indices
    return np.copy(img[row_start : row_end + 1, col_start : col_end + 1])


def gen_line_images(img2, unique_labels, bounding_boxes):
    # change here
    #   global lineheight_baseline_percentile
    line_images = []
    pad = 5
    for l in unique_labels:
        # Filter bounding boxes for the current label
        filtered_boxes = [box for box in bounding_boxes if box[4] == l]
        if not filtered_boxes:
            continue

        # Calculate the total width and maximum height for the new image
        total_width = (
            max(x for x, _, _, _, _ in filtered_boxes) + 500
        )  # 10 pixels padding on each side
        max_height = (
            max(h for _, _, _, h, _ in filtered_boxes) + 250
        )  # 5 pixels padding top and bottom
        miny = min(y for _, y, _, _, _ in filtered_boxes)
        # Create an empty image for this label
        new_img = np.ones((max_height, total_width), dtype=np.uint8) * np.int32(
            np.median(img2)
        )

        for box in filtered_boxes:
            x, y, w, h, l = box
            blob = img2[y - pad : y + h + pad, x - 10 : x + w + 10]
            new_img[y - miny : y - miny + h + 2 * pad, x - 10 : x + w + 10] = blob
        line_images.append(crop_img(new_img))

    return line_images


def run_manual_segmentation(manuscript_name, page):
    BASE_PATH = "/mnt/cai-data/manuscript-annotation-tool/manuscripts"
    IMAGE_FILEPATH = os.path.join(BASE_PATH, manuscript_name, "leaves", f"{page}.jpg")
    HEATMAP_FILEPATH = os.path.join(BASE_PATH, manuscript_name, "heatmaps", f"{page}.jpg")
    POINTS_FILEPATH = os.path.join(BASE_PATH, manuscript_name, "points-2D", f"{page}_points.txt")
    LABELS_FILEPATH = os.path.join(BASE_PATH, manuscript_name, "points-2D", f"{page}_labels.txt")
    LINES_DIR = os.path.join(BASE_PATH, manuscript_name, "lines", page)

    binarize_threshold = 100

    image = loadImage(IMAGE_FILEPATH)
    det = loadImage(HEATMAP_FILEPATH)
    filtered_points, filtered_labels = load_points_and_labels(POINTS_FILEPATH, LABELS_FILEPATH)

    det = det.squeeze()
    print(det.shape)
    if len(det.shape) == 3:  
        det = det[:, :, 0]  # Keep only one channel
    print(det.shape)

    #print(image.shape) this is x2 scale
    img2 = cv2.cvtColor(cv2.resize(image, det.shape[::-1]), cv2.COLOR_BGR2GRAY) 


    bounding_boxes = gen_bounding_boxes(det, binarize_threshold)
    labeled_bboxes = assign_labels_and_plot(bounding_boxes, filtered_points, filtered_labels, img2, output_path=os.path.join(BASE_PATH, manuscript_name, "points-2D", f"{page}.jpg"))

    # Sort by the numeric label (5th element)
    # sorted_bboxes = sorted(labeled_bboxes, key=lambda x: x[4])

    # Get unique labels
    unique_labels = set(label for _, _, _, _, label in labeled_bboxes)
    print(unique_labels)
    line_images = gen_line_images(img2,unique_labels,labeled_bboxes)

    shutil.rmtree(LINES_DIR)
    os.makedirs(LINES_DIR)

    for i in range(len(line_images)):
        cv2.imwrite(os.path.join(LINES_DIR, f"line{i+1:03d}.jpg"),line_images[i])




# m_name = 'man-seg-backup'
# MANUSCRIPT_DIR = f'/mnt/cai-data/manuscript-annotation-tool/manuscripts/{m_name}/'
# HEATMAP_DIR = MANUSCRIPT_DIR+'/heatmaps'
# IMAGES_DIR = MANUSCRIPT_DIR+'/leaves'
# LINES_DIR = MANUSCRIPT_DIR+'/lines'
# ANNOT_DIR = MANUSCRIPT_DIR+'/points-2D'

# inp_images, inp_file_names = load_images_from_folder(IMAGES_DIR)
# print(inp_file_names)
# heatmaps_images, heatmap_file_names = load_images_from_folder(HEATMAP_DIR)
# print(heatmap_file_names)

# binarize_threshold=100


# for det,image,file_name in zip(heatmaps_images,inp_images,inp_file_names):

#     filtered_points, filtered_labels = load_points_and_labels(f'{ANNOT_DIR}/{file_name[:-4]}_points.txt', f'{ANNOT_DIR}/{file_name[:-4]}_labels.txt')

#     # handling loading heatmaps
#     det = det.squeeze()  # Removes single-dimensional entries (e.g., (H, W, 1) → (H, W))
#     print(det.shape)
#     if len(det.shape) == 3:
#         det = det[:, :, 0]  # Keep only one channel
#     print(det.shape)

#     #print(image.shape) this is x2 scale
#     img2 = cv2.cvtColor(cv2.resize(image, det.shape[::-1]), cv2.COLOR_BGR2GRAY)


#     bounding_boxes = gen_bounding_boxes(det, binarize_threshold)
#     labeled_bboxes = assign_labels_and_plot(bounding_boxes, filtered_points, filtered_labels, img2, output_path=ANNOT_DIR+'/'+file_name)

#     # Sort by the numeric label (5th element)
#     sorted_bboxes = sorted(labeled_bboxes, key=lambda x: x[4])

#     # Get unique labels
#     unique_labels = set(label for _, _, _, _, label in labeled_bboxes)
#     print(unique_labels)
#     line_images = gen_line_images(img2,unique_labels,labeled_bboxes)

#     if os.path.exists(f'/mnt/cai-data/manuscript-annotation-tool/manuscripts/{m_name}/lines/{os.path.splitext(file_name)[0]}') == False:
#         os.makedirs(f'/mnt/cai-data/manuscript-annotation-tool/manuscripts/{m_name}/lines/{os.path.splitext(file_name)[0]}')
#     for i in range(len(line_images)):
#         cv2.imwrite(f'/mnt/cai-data/manuscript-annotation-tool/manuscripts/{m_name}/lines/{os.path.splitext(file_name)[0]}/line{i+1:03d}.jpg',line_images[i])
