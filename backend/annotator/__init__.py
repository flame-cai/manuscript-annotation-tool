from flask import Flask
from flask_cors import CORS

from annotator.models import db


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
    db.init_app(app)
    with app.app_context():
        db.create_all()

    CORS(app)

    from annotator import routes

    app.register_blueprint(routes.bp)

    return app
