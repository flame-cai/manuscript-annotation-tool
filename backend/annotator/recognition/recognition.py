import os
import subprocess
from annotator.recognition.demo import recognise_lines

def get_subfolders(folder_path):
    return [os.path.join(folder_path, subfolder) for subfolder in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, subfolder))]

def recognise_characters(folder_path):
    results = []
    lines_folder_path = os.path.join(folder_path, "lines")
    page_subfolder_paths = get_subfolders(lines_folder_path)
    for page_subfolder_path in page_subfolder_paths:
        results.append(recognise_lines(
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
        ))
    return results