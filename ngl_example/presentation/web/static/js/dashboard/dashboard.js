var stage;
function loadStructure(pdb_id){
	document.addEventListener( "DOMContentLoaded", function(){
            stage = new NGL.Stage( "viewport" );
            stage.setParameters({backgroundColor:"lightgrey"});
            stage.handleResize();
            stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            .then(function(o){
                o.addRepresentation( "cartoon", { sele: "protein"} );
                o.addTrajectory();
                o.autoView();
            });
            
            var toggleSideChains = document.getElementById( "toggleSideChains" );
            toggleSideChains.addEventListener( "click", function(){
            	stage.removeAllComponents();
            	stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            	.then(function(togg){
                	togg.addRepresentation('tube', { radius: 'sstruc'})
                	togg.addRepresentation('ball+stick', { sele: 'sidechainAttached'})
                	togg.addRepresentation('label', {
                		sele: '.CA',
                	    color: 'element',
                	    labelType: 'format',
                	    labelFormat: '%(resname)s %(chainname)s%(resno)s'
                	  })
                	  togg.autoView()
                	})
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
            
            // a button that centers the view on the selected residue
            var toggleSideChains = document.getElementById( "centeResidue" );
            toggleSideChains.addEventListener( "click", function(){
            	console.log('hey hoi, dit doet het nog niet');
			});
            
            
            // select a residue on the structure and get atom information
            stage.signals.clicked.add(function (pickingProxy){
              	if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
            		var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
            		var cp = pickingProxy.canvasPosition;
            		var atomData = atom.qualifiedName();
            	 	var atomPos = atomData.substr(5,2);
            		var positionDetails = document.getElementById("selectedResi");
            	 	positionDetails.innerText = 'Atom: '+ atom.qualifiedName() + "\n" 
            	 	+ cp.y + 3 + "px" + "\n" + cp.x + 3 + "px" + '\n' +
            	 	"Atom Position: " + atomPos;   
            	 	
            	}
            });
            
            // color the selected residues red 
            stage.signals.clicked.add(function (pickingProxy){
            	if(pickingProxy != undefined){
            	stage.loadFile( "rcsb://"+pdb_id)
        		.then(function (sel) {
	            	sel.addRepresentation('cartoon', {sele: 'sstruc'}, true)
	            	var colorthis = sel.addRepresentation('spacefill', {color: 'red'})
	            	sel.autoView()
	            	sel.setSelection('all')
	            	var atom = pickingProxy.atom || pickingProxy.closestBondAtom
	            	var atomData = atom.qualifiedName()
	            	var atomPosi = atomData.substr(5)
	            	colorthis.setSelection(atomPosi)
	                console.log("atomposition "+atomPosi)	
            	});
        	}
        });

            // a button that clears the view
            var clearView = document.getElementById( "clearView" );
            clearView.addEventListener( "click", function(){
            	stage.dispose();
            	console.log('Cleared the view!');
            });	
    });
}	 			