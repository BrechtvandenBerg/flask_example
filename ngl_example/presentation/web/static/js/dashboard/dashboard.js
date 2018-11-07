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
	var positionColor = {}
	var colorResid = $("#colorResid").val(); //  example of data structure A22:#f9d057,A34: #f9d057
	
	// separate out each key/value pair
    var parts = colorResid.split(',');
    for(var i = 0; i < parts.length; i++) {
        var p = parts[i];
        // split Key/Value pair
        var keyValuePair = p.split(':');
         
        // add Key/Value pair to Dictionary object
        var key = keyValuePair[0];
        var value = keyValuePair[1];
        positionColor[key] = value;
    	};
    
    	var colors = Object.values(positionColor);
    	console.log(colors);
    	
    
    console.log("---------------------------positions--------------------------------")
    	
    // the last step the extraction of positions
    var sortChainPositions = Object.keys(positionColor); 
    sortChainPositions.sort(); // sorting necessary for the selection    
    var chainPositions = sortChainPositions.toString();
    console.log(chainPositions);
    
    var prePositions = ''
    var positionsRaw = chainPositions.split(','); // extract the positions from chainPositions
    for(var j = 0; j < positionsRaw.length; j++) {
        var q = positionsRaw[j];
        var qq = q.slice(1) +",";
        prePositions  += qq;         
    }
    var positions = prePositions.slice(0,-1); 
    console.log(positions);
    
    
    
	return positionColor;
	//return [chainid, positions, color
};
// colors the residues given, receives data from parseInput
function residueColor(pdb_id, positionColor){
	var colorSele = document.getElementById("colorSelect");
	colorSele.addEventListener( "click", function(){
		positionColor = parseInput(positionColor);
		console.log(positionColor);
		
		stage.loadFile("rcsb://"+pdb_id).then(function(col) {
			col.addRepresentation('cartoon',{color:'lightgrey'});
			col.setSelection('all');
			var colorRes = col.addRepresentation('licorice',{color:Object.values(positionColor)});
			colorRes.setSelection("22:A");
		});
	});
};