from flask import Blueprint, g, render_template

bp = Blueprint('web', __name__)

@bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')