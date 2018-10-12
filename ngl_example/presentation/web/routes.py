from flask import Blueprint, render_template, request
from Bio.PDB import PDBList 
from werkzeug import redirect
from ngl_example.presentation.web.forms import pdbRequestForm

bp = Blueprint('web', __name__)

@bp.route('/', methods=('GET', 'POST'))
def index():
    form = pdbRequestForm()
    if form.validate_on_submit():
        return redirect('/render_pdb_id/'+str(form.pdb_id._value()))
    
    return render_template('index.html', form=form, pdb_id=None)

@bp.route('/render_pdb_id/<string:pdb_id>', methods=['GET', 'POST'])
def getPDB(pdb_id):
    form = pdbRequestForm()
    if form.validate_on_submit():
        return redirect('/render_pdb_id/'+str(form.pdb_id._value()))
    
    return render_template('index.html',form=form, pdb_id=pdb_id)






