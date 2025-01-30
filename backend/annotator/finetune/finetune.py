import os
import csv
import shutil
import random
import yaml
import pandas as pd

from datetime import datetime
from flask import current_app

from annotator.finetune.utils import AttrDict
from annotator.finetune.train import train
from annotator.models import db, UserAnnotationLog

BASE_PATH = "/mnt/cai-data/manuscript-annotation-tool/manuscripts"

def get_config(file_path):
    with open(file_path, 'r', encoding="utf-8") as stream:
        opt = yaml.safe_load(stream)
    opt = AttrDict(opt)
    if opt.lang_char == 'None':
        characters = ''
        for data in opt['select_data'].split('-'):
            csv_path = os.path.join(opt['train_data'], data, 'labels.csv')
            df = pd.read_csv(csv_path, sep='^([^,]+),', engine='python', usecols=['filename', 'words'], keep_default_na=False)
            all_char = ''.join(df['words'])
            characters += ''.join(set(all_char))
        characters = sorted(set(characters))
        opt.character= ''.join(characters)
    else:
        opt.character = opt.number + opt.symbol + opt.lang_char
    os.makedirs(f'./saved_models/{opt.experiment_name}', exist_ok=True)
    return opt

def finetune(annotations, app_context):
    app_context.push()

    opt = get_config(os.path.join("annotator", "finetune", "config_files", "config.yml"))

    TEMP_FOLDER = "temp"
    TRAIN_FOLDER = os.path.join(TEMP_FOLDER, "train")
    VAL_FOLDER = os.path.join(TEMP_FOLDER, "val")
    TRAIN_CSV_FILE = os.path.join(TRAIN_FOLDER, "labels.csv")
    VAL_CSV_FILE = os.path.join(VAL_FOLDER, "labels.csv")
    
    # Ensure the temp folder exists
    os.makedirs(TRAIN_FOLDER, exist_ok=True)
    os.makedirs(VAL_FOLDER, exist_ok=True)

    # Initialize the CSV files with headers if they don't exist
    for csv_file in [TRAIN_CSV_FILE, VAL_CSV_FILE]:
        if not os.path.exists(csv_file):
            with open(csv_file, mode='w', newline='') as csvfile:
                csvwriter = csv.writer(csvfile)
                csvwriter.writerow(["filename", "words"])
    

    for manuscript_name in annotations:
        for page in annotations[manuscript_name]:
            for line in annotations[manuscript_name][page]:
                ground_truth = annotations[manuscript_name][page][line]["ground_truth"]
                image_path = os.path.join(BASE_PATH, manuscript_name, "lines", page, line + ".jpg")
                filename = os.path.basename(image_path)

                # Create log entry
                log_entry = UserAnnotationLog(
                    manuscript_name=manuscript_name,
                    page=page,
                    line=line,
                    ground_truth=ground_truth,
                    levenshtein_distance=annotations[manuscript_name][page][line]["levenshtein_distance"],
                    image_path=image_path,
                    timestamp=datetime.now(),
                )
                db.session.add(log_entry)

                # Randomly assign to train or val (80% train, 20% val)
                if random.random() < 0.8:
                    target_folder = TRAIN_FOLDER
                    target_csv = TRAIN_CSV_FILE
                else:
                    target_folder = VAL_FOLDER
                    target_csv = VAL_CSV_FILE

                # Copy the image to the appropriate folder
                try:
                    shutil.copy(image_path, target_folder)
                except FileNotFoundError:
                    print(f"Image not found: {image_path}")

                # Append to the appropriate CSV file
                with open(target_csv, mode='a', newline='') as csvfile:
                    csvwriter = csv.writer(csvfile)
                    csvwriter.writerow([filename, ground_truth])
    db.session.commit()
    
    train(opt, amp=False, manuscript_name=list(annotations.keys())[0])