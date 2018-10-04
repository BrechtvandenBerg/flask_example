from flask import Blueprint, g, render_template, request
from Bio.PDB import PDBList 

bp = Blueprint('web', __name__)

pdbl = PDBList()
@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method =='POST':
        if request.form['submit'] == "iets":
            pdblist = request.form['geneName']
            for i in pdblist:
                pdbl.retrieve_pdb_file(i,pdir='PDB')

    return render_template('index.html')

@bp.route('/<string:pdb_id>', methods=['GET', 'POST'])
def getPDB(pdb_id):
    return render_template('index.html', pdb_id=pdb_id)