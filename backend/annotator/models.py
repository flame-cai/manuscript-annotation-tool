from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class RecognitionLog(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    image_path: Mapped[str]
    predicted_label: Mapped[str]
    confidence_score: Mapped[float]
    timestamp: Mapped[datetime]
    manuscript_name: Mapped[str]
    page: Mapped[str]

