function loadStructure(pdb_id){
	document.addEventListener( "DOMContentLoaded", function(){
            stage = new NGL.Stage( "viewport" );
            stage.setParameters({backgroundColor:"white"});
            stage.handleResize();
            stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            .then(function(o){
                o.addRepresentation( "cartoon", { sele: "protein"} );
                o.addTrajectory();
                o.autoView();
                residueMutation(pdb_id);
                residueColor(pdb_id);
            });
            
            // a button that clears the view
            var clearView = document.getElementById( "clearView" );
            clearView.addEventListener( "click", function(){
            	stage.removeAllComponents();
            	console.log('Cleared the view!');
            });
            
            // a button that centers the view 
            var centered = document.getElementById( "centerView" );
            centered.addEventListener( "click", function(){
            	stage.autoView();
            	console.log('Centered the view!');
            });      
            
            // create tooltip element and add to the viewer canvas
            var tooltip = document.createElement("div");
            Object.assign(tooltip.style, {
            	display: "none",
            	position: "absolute",
            	zIndex: 10,
            	pointerEvents: "none",
            	backgroundColor: "rgba(0, 0, 0, 0.6)",
            	color: "lightgrey",
            	padding: "0.5em",
              	fontFamily: "sans-serif"
            });
            stage.viewer.container.appendChild(tooltip);
           
            // color the selected residue
            stage.signals.clicked.add(function (pickingProxy){
            	if(pickingProxy != undefined){
            	stage.loadFile( "rcsb://"+pdb_id).then(function (sel) {
            		sel.addRepresentation('cartoon',{color:'lightgrey'});
	            	sel.setSelection('all');
            		var colorthis = sel.addRepresentation('ball+stick', {color:'resname'});
	            	var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
	            	var atomData = atom.qualifiedName();
	            	var atomPosi = atomData.slice(0,-3);
	            	var atomPosi2 = atomPosi.substr(5);
	            	var atomSide = atomPosi2+" AND sidechainAttached";
	            	console.log(atomSide);
	            	colorthis.setSelection(atomSide);
	                console.log("Atom Position: "+atomPosi2);
	                sel.autoView();	   
	                
	             // Get the checkbox
	                var radBox = document.getElementById("radCheck");
	             // If the checkbox is checked, display the output text
	                if (radBox.checked == true){
		                var selection = new NGL.Selection( atomPosi2 );
		                var radius = 5;
		                var atomSet = sel.structure.getAtomSetWithinSelection( selection, radius );
		                // expand selection to complete groups
		                var atomSet2 = sel.structure.getAtomSetWithinGroup( atomSet );               
		                sel.addRepresentation( "licorice", { sele: atomSet2.toSeleString() } );
		                sel.addRepresentation( "cartoon", {color:'lightgrey'} );
		                sel.autoView();	                            	
	            		};
            		});
            	};
            });
            
            var toggleSideChains = document.getElementById( "toggleSideChains" );
            toggleSideChains.addEventListener( "click", function(){
            	stage.removeAllComponents();
            	stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            	.then(function(togg){
                	togg.addRepresentation('tube', { radius: 'sstruc'});
                	togg.addRepresentation('ball+stick', { sele: 'sidechainAttached'});
                	togg.addRepresentation('label', {
                		sele: '.CA',
                	    color: 'element',
                	    labelType: 'format',
                	    labelFormat: '%(resname)s %(chainname)s%(resno)s'
                });
            });	
        });	            
	});
};	

function residueMutation(pdb_id){
	var swapResis = document.getElementById("swapResidues");
	swapResis.addEventListener( "click", function(){
		stage.loadFile("rcsb://"+pdb_id).then(function(component) {
			struc = component;
			struc.structure.eachResidue(function (rp) {
        	    if (rp.isWater()) return;
        	    var sele = '';
        	    if (rp.resno !== undefined) sele += rp.resno;
        	    if (rp.chain) sele += ':' + rp.chainname;
        	    var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele;
        	    //console.log(name);
			});
		});
	});
};

function parseInput(colorResid){
	//structure=        [position:chainid][color], [22:A][blue], etc
	var colorResid= $("#colorResid").val();
	var positions = colorResid.slice(0,-2);
	var chainid = colorResid.slice(-2);
	var parsed = positions +" and "+ chainid;
		
	return parsed;
};

// colors the residues given, receives data from parseInput
function residueColor(pdb_id, parsed){
	var colorSele = document.getElementById("colorSelect");
	colorSele.addEventListener( "click", function(){
		parsed = parseInput(parsed);
		stage.loadFile("rcsb://"+pdb_id).then(function(col) {
			col.addRepresentation('cartoon',{color:'lightgrey'});
			col.setSelection('all');
			var colorRes = col.addRepresentation('tube',{color:'#ffff8c'});
			colorRes.setSelection(parsed);
		});
	});
};