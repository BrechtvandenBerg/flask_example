from flask_wtf.form import FlaskForm
from wtforms.fields.simple import TextField
from wtforms import validators

class pdbRequestForm(FlaskForm):
    pdb_id = TextField(u'', [validators.required(), validators.length(max=4)])
    