import os

from datetime import datetime

from annotator.models import db, UserAnnotationLog

BASE_PATH = "/mnt/cai-data/manuscript-annotation-tool/manuscripts"

def finetune(annotations):
    for manuscript_name in annotations:
        for page in annotations[manuscript_name]:
            for line in annotations[manuscript_name][page]:
                log_entry = UserAnnotationLog(
                    manuscript_name=manuscript_name,
                    page=page,
                    line=line,
                    ground_truth=annotations[manuscript_name][page][line]["ground_truth"],
                    levenshtein_distance=annotations[manuscript_name][page][line]["levenshtein_distance"],
                    image_path=os.path.join(BASE_PATH, manuscript_name, page, line, ".jpg"),
                    timestamp=datetime.now(),
                )
                db.session.add(log_entry)
    db.session.commit()