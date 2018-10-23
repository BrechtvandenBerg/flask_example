var stage;
function loadStructure(pdb_id){
	document.addEventListener( "DOMContentLoaded", function(){
            stage = new NGL.Stage( "viewport" );
            stage.setParameters({backgroundColor:"lightgrey"});
            stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            .then(function(o){
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.addTrajectory();
                o.autoView();
            });
            stage.signals.clicked.add(function (pickingProxy){
            	console.log("picking"); 
            	if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
            		var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
            		var cp = pickingProxy.canvasPosition;
            		var positionDetails = document.getElementById("selectedResi");
            	 	positionDetails.innerText = 'Atom: '+ atom.qualifiedName()+"\n" + cp.y + 3 + "px" +"\n" + cp.x + 3 + "px"; 
            		}
            	});	 	
         // create tooltip element and add to the viewer canvas
        	var tooltip = document.createElement("div");
        	Object.assign(tooltip.style, {
        	  display: "none",
        	  position: "absolute",
        	  zIndex: 10,
        	  pointerEvents: "none",
        	  backgroundColor: "rgba(0, 0, 0, 0.6)",
        	  color: "black",
        	  padding: "0.5em",
        	  fontFamily: "sans-serif"
        	});
        	stage.viewer.container.appendChild(tooltip);
        	
        	// listen to `hovered` signal to move tooltip around and change its text
        	stage.signals.hovered.add(function (pickingProxy) {
        		console.log("hovered"); 

        	  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
        	    var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
        	    var cp = pickingProxy.canvasPosition;
        	    tooltip.innerText = "ATOM: " + atom.qualifiedName();
        	    tooltip.style.bottom = cp.y + 3 + "px";
        	    tooltip.style.left = cp.x + 3 + "px" + "blablabla";
        	    tooltip.style.display = "block";
        	  }else{
        	    tooltip.style.display = "none";
        	  }

        	});	
            
            
            
            
            
            
    	});
	

	
	
}	 		

//function selectionDetails(atom , cp){
//	 		var positionDetails = document.getElementById("..... div ID");
//	 		positionDetails.innerHTML = 'test: '; 
	        
	
	        
	    	// change color of atom when clicked
// 	    	var schemeId = NGL.ColormakerRegistry.addScheme(function (params) {
// 	    		this.atomColor = function (atom) {
// 	    		stage.signals.hovered.add(function (pickingProxy) {
// 	    			if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)){
// 	    		    	return 	0xFFFF00 //Yellow
// 						}
// 	    		    }
// 	    		 }
// 	    	});    	