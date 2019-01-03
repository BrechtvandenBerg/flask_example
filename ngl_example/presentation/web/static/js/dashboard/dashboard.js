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
//	var getColorscheme = document.getElementById("ColorResid");
//	getColorscheme.addEventListener("click", function(){
	var chainColor = {};
	var chainPos = {};
	var arrayColorPos = [];
	var colorResid = $("#colorResid").val(); //  example of data structure A22:#f9d057,A34: #f9d057
	//console.log(colorResid);
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

//        if(chain in chainColor){
//        	chainColor[chain] = chainColor[chain], arrayColorPos;
//        }else{
//        	var helpingArray = [];
//        	chainColor[chain] = arrayColorPos;
//        }
//        console.log(arrayColorPos);
//        //console.log(chain);
//        //console.log(position);
    	};
    
    console.log(chainColor);

    return chainColor;
};    
    /******* 
	Count how many colors are added and then sort by color, every color will get an array of chain id and positions
	input: ...
	output: ...
    *******/    
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
    console.log("---------------------------chain id--------------------------------");
    console.log(sortedColors);

   //specifiy selection of interest, ex.: two specific residues (80 and 92) 
    
    // data structure = {"color":"chain id""position"}, {... , ...} 

    
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


    console.log("---------------------------positions--------------------------------");
//};  

    /*******
	Extraction of positions	from the sorting of the colors and chainids
    *******/
//    var prePositions = '';
//    var positionsRaw = chainPositions.split(','); // extract the positions from chainPositions
//    for(var j = 0; j < positionsRaw.length; j++) {
//        var q = positionsRaw[j];
//        var qq = q.slice(1) +"," ;
//        var pp = q.substr(0,1)+",";
//        prePositions  += qq;
//    }
//    
//    var positions = "("+ prePositions.slice(0,-1) +")"; 
//    console.log(positions);
/*****
Colors the residues given, receives data from parseInput
input: ...
output: ...
function residueColor(pdb_id, colorChainpos){
	var colorChainpos = parseInput();
    for (const [key, value] of Object.entries(colorChainpos)) {

    	console.log(key);
    	chainnumbers = value.split(",");
    	for(let i = 0; i < chainnumbers.length; i++) {
        	chainnumber = chainnumbers[i];
        	console.log(chainnumber);
            var chain = chainnumber.substring(0,1);
            var position = chainnumber.substring(1);
            stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
            .then(function(col){
    				//col.setSelection('all');
    				//col.addRepresentation('cartoon',{color:'lightgrey'});
            		console.log(col.getRepresentation());
    				var colorRes = col.addRepresentation('hyperball',{color:"red"});
    				colorRes.setSelection(":"+chain+" AND ("+position+")");
    				console.log(":"+chain+" AND ("+position+")")
    		});
        }
    }
    stage.loadFile( "rcsb://"+pdb_id, { asTrajectory: true } )
    .then(function(col){o.autoView();});
};
******/
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
    
//    	chainnumbers = value.split(",");
//    	for(let i = 0; i < chainnumbers.length; i++) {
//        	chainnumber = chainnumbers[i];
//        	//console.log(chainnumber);
//            var chain = chainnumber.substring(0,1);
//            //console.log(chain);
//            var position = chainnumber.substring(1);
//            //console.log(position);
//    	}
    
//var anScheme = [
//	['#e76818', '64-74 or 134-154 or 222-254 or 310-310 '], ["red"," 322-326"], ["green", "311-322"], ["yellow", "40-63 or 75-95 or 112-133 or 155-173 or 202-221 or 255-277 or 289-309"], ["blue", "1-39 or 96-112 or 174-201 or 278-288"], ["white", "*"]
//]
//          var colorSele = document.getElementById("colorSelect");
//			stage.loadFile("rcsb://"+pdb_id).then(function(o) {
//				var schemeId = NGL.ColormakerRegistry.addSelectionScheme(anScheme);
//				 o.setSelection(":B");
//				 o.addRepresentation("cartoon", {color: schemeId });  // pass schemeId here
//			});
    	
    
};