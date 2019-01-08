/***
 * 
 * @param pdb_id
 * @returns
 */
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
            stage.signals.clicked.add(function (pickingProxy){
            	if(pickingProxy != undefined){
            	stage.loadFile( "rcsb://"+pdb_id).then(function (sel) {
            		sel.addRepresentation('contact',{color:'lightgrey'});
	            	sel.setSelection('all');
            		var colorthis = sel.addRepresentation('spacefill', {color:'resname'});
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
//Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );

/***
 * 
 * @param pdb_id
 * @returns
 */
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

/***
 * parses the input from the user or other program.
 * @param colorResid (string) the input given from a user or other program example of data: A22:#e76818,B33:#f29e2e,A21:#f29e2e,A23:#e76818,B43:#f29e2e,A29:#f29e2e,A51:#e76818,B11:#f29e2e
 * @returns chainColor (object) an object with the chains as keys followed by color and positions as values. 
 */
function parseInput(colorResid){
//	var getColorscheme = document.getElementById("ColorResid");
//	getColorscheme.addEventListener("click", function(){
	var chainColor = {};
	var chainPos = {};
	var arrayColorPos = [];
	var colorResid = $("#colorResid").val(); 
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
 * this function takes an copy of a Metadome output and translates that into an array of arrays.
 * @param colorResid (string) a copy of the metadome/api/result/"identifier"/ where identifier stands for the protein that will be shown.
 * @returns metadomeColorArray (array) an array of arrays with a color code and positional data.
 */
function parseMetadome(colorResid){
	var metadomeData = $("#colorResid").val(); 
	var metadomeColorArray = [];
	var colorData = metadomeData.split("sw_dn_ds");
	colorData.shift(); //remove the first array that incorrectly shows "domains: "  
	positionData = metadomeData.split("protein_pos");
	positionData.shift(); //remove the first array that incorrectly shows "domains: "  
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
	
    /******* 
	Count how many colors are added and then sort by color, every color will get an array of chain id and positions
	input: ...
	output: ...
function colorSort(positionColor){
	// output = {color:[A12, A56]}
	// input: array:[A12, A56, B56] 
	// output: string 'A and (12, 56) and B (56)'
	Object.values(positionColor).sort();
	console.log(Object.values(positionColor));
    

    var sortedColors = {};
    for (var color_key in positionColor){
    	if (!(positionColor[color_key] in sortedColors)){
    		sortedColors[positionColor[color_key]] = [];
    	}
    	
    	sortedColors[positionColor[color_key]].push(color_key);
    }
    
    console.log(sortedColors);
    chainidSort(sortedColors);
    return sortedColors;
}
    
function chainidSort(sortedColors){
    console.log(sortedColors);

    
    var values = Object.values(sortedColors);
    console.log(values);
    for (var h = 0; values.length; h++){
    	sortValues = values[h].sort(); 
    	console.log(sortValues);
    	stringSortValues = sortValues.toString();
    	console.log(stringSortValues);
    	splitValues = stringSortValues.split(",");
    	console.log(splitValues);
    	    return stringSortValues

    }
}
    *******/    

/***
 * uses data provided from parseInput(chainColor) to make a scheme for the colors and use that scheme to color the protein.
 * @param pdb_id the PDB identifier for protein visualisation.
 * @param chainColor (object) chain as key and color, position for values.
 * @returnsa visualisation of a protein with the colors provided .
 */
function residueColor(pdb_id, chainColor){
	var chainColor = parseInput();
    for (const [key, value] of Object.entries(chainColor)) {
	    var colorSele = document.getElementById("colorSelect");
		stage.loadFile("rcsb://"+pdb_id).then(function(o) {
			 var schemeId = NGL.ColormakerRegistry.addSelectionScheme(value);
			 o.setSelection(":"+key);
			 o.addRepresentation("cartoon", {color: schemeId });  // pass schemeId here
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
	//console.log(metadomeColorArray);
	stage.loadFile("rcsb://"+pdb_id).then(function(o) {
		console.log(pdb_id)
		var schemeId = NGL.ColormakerRegistry.addSelectionScheme(metadomeColorArray);
		o.setSelection("all");
		o.addRepresentation("cartoon", {color: schemeId });  // pass schemeId here
		o.autoView();    
	});
};