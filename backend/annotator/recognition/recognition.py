import os
import subprocess

from datetime import datetime
from annotator.recognition.demo import recognise_lines
from annotator.models import db, RecognitionLog

def get_subfolders(folder_path):
    return [os.path.join(folder_path, subfolder) for subfolder in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, subfolder))]

def recognise_characters(folder_path):
    lines_of_all_pages = []
    lines_folder_path = os.path.join(folder_path, "lines")
    page_subfolder_paths = get_subfolders(lines_folder_path)
    for page_subfolder_path in page_subfolder_paths:
        lines_of_one_page = recognise_lines(
            image_folder=page_subfolder_path,
            saved_model="/mnt/cai-data/manuscript-annotation-tool/models/segmentation/best_norm_ED.pth",
            transformation=None,
            feature_extraction="ResNet",
            sequence_modeling="BiLSTM",
            prediction="CTC",
            workers=0,
            batch_max_length=250,
            imgH=50,
            imgW=2000,
            pad=True,
            character="""`0123456789~!@#$%^&*()-_+=[]\\{}|;':",./<>? abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.ँंःअअंअःआइईउऊऋएऐऑओऔकखगघङचछजझञटठडढणतथदधनऩपफबभमयरऱलळवशषसह़ािीुूृॅेैॉोौ्ॐ॒क़ख़ग़ज़ड़ढ़फ़ॠ।०१२३४५६७८९॰""",
            hidden_size=512,
            output_channel=512,
        )
        for line in lines_of_one_page:
            log_entry = RecognitionLog(
                image_path=line["image_path"],
                predicted_label=line["predicted_label"],
                confidence_score=line["confidence_score"],
                timestamp=datetime.now()
            )
            db.session.add(log_entry)
            db.session.commit()
        lines_of_all_pages.append(lines_of_one_page)
    return lines_of_all_pages