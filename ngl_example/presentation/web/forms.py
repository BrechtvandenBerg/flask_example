from flask_wtf.form import FlaskForm
from wtforms.fields.simple import TextField
from wtforms import validators

class pdbRequestForm(FlaskForm):
    pdb_id = TextField(u'',[validators.required(), validators.Length(min=4, max=4)], render_kw={"placeholder": "PDB ID here"})
    #ID: The HTML ID of this field. If unspecified, this is generated for you to be the same as the field name.