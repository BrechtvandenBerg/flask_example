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
	//console.log(colorResid);
	/*******
	First the 'colorResid' array is converted to an Object/dictionary for better separation of color, chain id and positions
	*******/
	// separate out each key/value pair
    var parts = colorResid.split(',');
    for(var i = 0; i < parts.length; i++) {
        var p = parts[i];
        // split key/value pair
        var keyValuePair = p.split(':');
        // add key/value pair to dictionary object
        var key = keyValuePair[0];
        var value = keyValuePair[1];
        positionColor[key] = value;
    	};
    	
    var correctedPosCol = Object.keys(positionColor).reduce(function(obj,key){
    	obj[ positionColor[key] ] = key;
    	return obj;
    	},{});
    //console.log(correctedPosCol);	
    	
    //console.log(positionColor);	
    colorSort(positionColor);
    chainidSort(positionColor);
    return positioncolor;
};    
    /******* 
	Count how many colors are added and then sort by color, every color will get an array of chain id and positions
	input: ...
	output: ...
    *******/    
function colorSort(positionColor){
	//output = {color:[A12, A56]}
	// input: array:[A12, A56, B56] 
	// output: string 'A and (12, 56) and B (56)'
	
    var colors = Object.values(positionColor);
    //console.log(colors);
    var map = colors.reduce(function(obj, b) { // this will reduce the same color id's to one 
    obj[b] = ++obj[b] || 1;
    	return obj;
    }, {});
    var countColor = Object.values(map).length;
    console.log(Object.keys(map));
   
    everyColor = Object.keys(map).forEach(function(element){
    	console.log(element);
    	});
    var sDataArray = MultiDimensionalArray(countColor);
    console.log(sDataArray);
    
    
    for(var key in positionColor) {
        if(positionColor[key] === "#e76818" ){
        	console.log(key);
        	sDataArray[0].push(key);
        };
    }; 
        console.log(sDataArray[0]);

    
    var count = 0;
    //for 
    
    
    
    
};   
function MultiDimensionalArray(iRows,iCols){
    var i;
    var j;
       var a = new Array(iRows);
       for (i=0; i < iRows; i++){
           a[i] = new Array(iCols);
           for (j=0; j < iCols; j++){           
        	   a[i][j]= "";
           };
       };
       return(a);
    }; 
    
function chainidSort(positionColor){
    console.log("---------------------------chain id--------------------------------");
    var sortChainPositions = Object.keys(positionColor); 
    sortChainPositions.sort();  
    var chainPositions = sortChainPositions.toString();
    console.log(chainPositions);
    var preChain = '';
    var chainid = chainPositions.split(','); // extract the chain from chainPositions
    for(var k = 0; k < chainid.length; k++) {
        var q = chainid[k];
        var pp = q.substr(0,1)+",";
        preChain += pp;
    }
    
    var chainid = preChain.slice(0,-1);
    console.log(chainid);
    

    console.log("---------------------------positions--------------------------------");
};  


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

// colors the residues given, receives data from parseInput
function residueColor(pdb_id){
	var colorSele = document.getElementById("colorSelect");
	colorSele.addEventListener( "click", function(){
		stage.loadFile("rcsb://"+pdb_id).then(function(col) {
			parseInput();
			col.addRepresentation('cartoon',{color:'lightgrey'});
			col.setSelection('all');
			var colorRes = col.addRepresentation('licorice',{color:'blue'});
			colorRes.setSelection("22:A");
		});
	});
};