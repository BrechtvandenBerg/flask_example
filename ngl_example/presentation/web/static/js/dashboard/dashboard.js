/***
 * This function takes the PDB ID and instances the stage canvas wherein the protein structure will load and be able to 
 * @param pdb_id
 * @returns
 */
function loadStructure(pdb_id){
	document.addEventListener( "DOMContentLoaded", function(){
            stage = new NGL.Stage( "viewport" ); 							// creates a stage in which the protein will be visualized
            stage.setParameters({backgroundColor:"white"}); 				// set the background color to white
            stage.handleResize();
            stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            .then(function(o){
                o.addRepresentation( "cartoon", { sele: "protein"} );		// the default representation for the protein to be in the cartoon style
                o.addTrajectory();
                o.autoView();
                //residueColor(pdb_id);
                colorToleranceLandscape(pdb_id);

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
            stage.signals.clicked.add(function (pickingProxy){								// creates a 'listener' for when a click happens on the stage canvas
            	if(pickingProxy != undefined){												// allocate a function to the pickingProxy
            	stage.loadFile( "rcsb://"+pdb_id).then(function (sel) {						// reset the protein to be able to influence the representation of the protein structure
            		sel.addRepresentation('contact',{color:'lightgrey'});					// show all the contacts the amino acids have with each other
	            	sel.setSelection('all');
            		var colorthis = sel.addRepresentation('spacefill', {color:'resname'});	// changes the representation of the clicked amino acid and colors it based on the amino acid type
	            	var atom = pickingProxy.atom || pickingProxy.closestBondAtom;			
	            	var atomData = atom.qualifiedName();									// get the information on the clicked atom 
	            	var atomPosi = atomData.slice(0,-3);									 
	            	var atomPosi2 = atomPosi.substr(5);										// atomPosi 1 and 2 will get only the position of the clicked amino acid
	            	var atomSide = atomPosi2+" AND sidechainAttached";						// atom side has to be created to only select one amino acid if not allocated will show the whole structures side chains 
	            	console.log(atomSide);
	            	colorthis.setSelection(atomSide);										// set the selection only apply to the clicked amino acid
	                console.log("Atom Position: "+atomPosi2);
	                sel.autoView();	   
	                
	             // Get the checkbox
	                var radBox = document.getElementById("radCheck");
	             // If the checkbox is checked, display the output text
	                if (radBox.checked == true){
		                var selection = new NGL.Selection( atomPosi2 );
		                var radius = 5;
		                var atomSet = sel.structure.getAtomSetWithinSelection( selection, radius );		// expand selection to complete groups
		                var atomSet2 = sel.structure.getAtomSetWithinGroup( atomSet );               
		                sel.addRepresentation( "licorice", { sele: atomSet2.toSeleString() } );
		                sel.addRepresentation( "cartoon", {color:'lightgrey'} );
		                sel.autoView();	                            	
	            		};
            		});
            	};
            });
            
            var toggleSideChains = document.getElementById("toggleSideChains" );
            toggleSideChains.addEventListener( "click", function(){								// creates a button when clicked it will show the side chains
            	var metadomeColorArray = parseMetadome();										// takes the color scheme from parseMetadome
        		var schemeId = NGL.ColormakerRegistry.addSelectionScheme(metadomeColorArray);	// make variable to be used for coloring and showing the side chains
            	stage.removeAllComponents();													// reset the stage so it won't show multiple structures on top of each other 
            	stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )						
            	.then(function(togg){
                	togg.addRepresentation('tube', {color:schemeId, radius: 'sstruc'}); 		// changes the representation of the protein structure and sets it to tube and sets the radius to sstruc meaning the secondary structure
                	togg.addRepresentation('ball+stick', { sele: 'sidechainAttached'});			// changes the representation of the side chains by usage of 'sidechainAttached' to ball and stick
                	togg.addRepresentation('label', {											// creates the label and places it on the backbone showing the amino acid, chain, and position
                		sele: '.CA',
                	    color: 'element',
                	    labelType: 'format',
                	    labelFormat: '%(resname)s %(chainname)s%(resno)s'
                });
            });	
        });	            
	});
};	
//Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );

/***
 * parses the input from the user or other program. 
 * 
 * 
 * THIS FUNCTION DOES NOT WORK!!!
 * 
 * 
 * @param colorResid (string) the input given from a user or other program example of data: A22:#e76818,B33:#f29e2e,A21:#f29e2e,A23:#e76818,B43:#f29e2e,A29:#f29e2e,A51:#e76818,B11:#f29e2e
 * @returns chainColor (object) an object with the chains as keys followed by color and positions as values. 
 */
function parseInput(colorResid){

	var chainColor = {};
	var chainPos = {};
	var arrayColorPos = [];
	var colorResid = $("#colorResid").val(); // get the value from the "colorResid" field
	console.log(colorResid);
	/*******
	First the 'colorResid' array is converted to an Object/dictionary for better separation of color, chain id and positions
	*******/
	// separate out each key/value pair
    var parts = colorResid.split(',');
    for(let i = 0; i < parts.length; i++) {
        var p = parts[i];
        // split key/value pair
        var keyValuePair = p.split(':');
        // add key/value pair to dictionary object
        var key = keyValuePair[0];
        
        var chain = key.substring(0,1);
        var position = key.substring(1);
        
        if (chain in chainColor){
        	
        	console.log(chainColor[chain])
        	console.log(chain in chainColor);
        	var helpArray = [];
        	helpArray.push(keyValuePair[1], position);
        	console.log(helpArray);
        	arrayColorPos.push(helpArray);
        	console.log(arrayColorPos);
        	//chainColor[chain] = chainColor[chain]+", ['"+keyValuePair[1]+"', '"+position+"']";
        	chainColor[chain] = chainColor[chain], arrayColorPos;
        	console.log(Object.keys(chainColor))
        	
        }else{
        	var helpingArray = [];
        	helpingArray.push(keyValuePair[1], position);
        	arrayColorPos.push(helpingArray);
        	//chainColor[chain] = "['"+keyValuePair[1]+"', '"+position+"']";
        	chainColor[chain] = arrayColorPos;
        	
        	//console.log(helpingArray)
        }
    };
    
    console.log(chainColor);

    return chainColor;
};    

/***
 * this function takes a copy of a Metadome output and translates that into an array of arrays.
 * @param colorResid (string) a copy of the metadome/api/result/"identifier"/ where identifier stands for the protein that will be shown.
 * @returns metadomeColorArray (array) an array of arrays with a color code and positional data.
 */
function parseMetadome(colorResid){
	var metadomeData = $("#colorResid").val(); 
	var metadomeColorArray = [];
	var colorData = metadomeData.split("sw_dn_ds"); 	//splits the line after "sw_dn_ds" to get the color code
	colorData.shift(); 									//remove the first array that shows "domains: "  
	positionData = metadomeData.split("protein_pos");   //splits the line after "protein_pos" to get the protein position
	positionData.shift(); 								//remove the first array that shows "domains: "  
	for(let i = 0; i < colorData.length; i++){
		var identifyPosition = positionData[i];
		var identifiedPosition = identifyPosition.split(",")[0];
		var position = identifiedPosition.substring(3);
		
		var identifyColor = colorData[i];
		var identifiedColor = identifyColor.split(",")[0];
		var colorString = identifiedColor.substr(3);
		var colorNumber = parseFloat(colorString);
		var colorID = makeColor(colorNumber);
		
		if(!(position in metadomeColorArray)){
			var colorArrayArray = [];
			colorArrayArray.push(colorID, position)
		}
		metadomeColorArray.push(colorArrayArray);
		
	}
	console.log(metadomeColorArray.toString());
	
	return metadomeColorArray;
}
/***
 * this function categorizes the float number got from the colorResid from function parseMetadome.
 * @param colorNumber (float) this number will be categorized into a color.
 * @returns a color code. 
 */
function makeColor(colorNumber){
	
	var toleranceColorGradient = [ {
		offset : "0%",
		color : "#d7191c"
	}, {
		offset : "12.5%",
		color : "#e76818"
	}, {
		offset : "25%",
		color : "#f29e2e"
	}, {
		offset : "37.5%",
		color : "#f9d057"
	}, {
		offset : "50%",
		color : "#ffff8c"
	}, {
		offset : "62.5%",
		color : "#90eb9d"
	}, {
		offset : "75%",
		color : "#00ccbc"
	}, {
		offset : "87.5%",
		color : "#00a6ca"
	}, {
		offset : "100%",
		color : "#2c7bb6"
	} ]	
		
	if (colorNumber <= 0.175) {
		return toleranceColorGradient[0].color;
	} else if (colorNumber <= 0.35) {
		return toleranceColorGradient[1].color;
	} else if (colorNumber <= 0.525) {
		return toleranceColorGradient[2].color;
	} else if (colorNumber <= 0.7) {
		return toleranceColorGradient[3].color;
	} else if (colorNumber <= 0.875) {
		return toleranceColorGradient[4].color;
	} else if (colorNumber <= 1.025) {
		return toleranceColorGradient[5].color;
	} else if (colorNumber <= 1.2) {
		return toleranceColorGradient[6].color;
	} else if (colorNumber <= 1.375) {
		return toleranceColorGradient[7].color;
	} else {
		return toleranceColorGradient[8].color;
	}
}
	
/***
 * uses data provided from parseInput(chainColor) to make a scheme for the colors and use that scheme to color the protein.
 * @param pdb_id the PDB identifier for protein visualization.
 * @param chainColor (object) chain as key and color, position for values.
 * @returns a visualization of a protein with the colors provided .
 */
function residueColor(pdb_id, chainColor){
	var chainColor = parseInput();
    for (const [key, value] of Object.entries(chainColor)) {
	    var colorSele = document.getElementById("colorSelect");
		stage.loadFile("rcsb://"+pdb_id).then(function(o) {
			 var schemeId = NGL.ColormakerRegistry.addSelectionScheme(value);
			 o.setSelection(":"+key);											
			 o.addRepresentation("cartoon", {color: schemeId });  				// pass schemeId here
			 o.autoView();
		});
	}
}
/***
 * uses data provided from parseMetadome(metadomeColorArray) to make a color scheme to color the protein structure. 
 * @param pdb_id the PDB identifier for protein visualisation.
 * @param metadomeColorArray (array) an array of arrays with a color code and positional data.
 * @returns a visualisation of a protein with the colors provided.
 */
function colorToleranceLandscape(pdb_id, metadomeColorArray){
	var metadomeColorArray = parseMetadome();
	stage.loadFile("rcsb://"+pdb_id).then(function(o) {
		var schemeId = NGL.ColormakerRegistry.addSelectionScheme(metadomeColorArray);		// creates a custom color scheme for protein coloring
		o.setSelection("all");																// first has to allocate all possible positions
		o.addRepresentation("cartoon", {color: schemeId });  								// pass schemeId here
		o.autoView();    
	});
};