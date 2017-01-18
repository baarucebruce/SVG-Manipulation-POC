// variable initialization
var	id = 4;
var min_value = 0;
var max_width = 480;
var max_height = 240;
var conversion_value = 5;

// gcode values
var initialZClearance = 0.5;
var cutDepth = -0.1250;
var IPM = 20;

var colors = ["Black", "White", "Blue", "Green", "Red", 
				"Yellow", "Orange", "Purple", "Gray", "Gold", 
				"Silver", "Brown", "Lime", "SteelBlue", "Chocolate",
				"SlateGray"];
var currentColor = "Blue";
			
//starting square coordinates dataset
var squareCoords = [ 
	{ "id": 0, "x": 0, "y": 0 }, 
	{ "id": 1, "x": max_width, "y": 0 }, 
	{ "id": 2, "x": max_width, "y": max_height }, 
	{ "id": 3, "x": 0, "y": max_height }
] ;							

//starting nodes dataset
var nodeCoords = [
	{ "id": 0, "color": "black", "x": 0, "y": 0, "r": 5, "o": 1},
	{ "id": 1, "color": "black", "x": max_width, "y": 0, "r": 5, "o": 1},
	{ "id": 2, "color": "black", "x": max_width, "y": max_height, "r": 5, "o": 1},
	{ "id": 3, "color": "black", "x": 0, "y": max_height, "r": 5, "o": 1}
];
			
// create SVG drawing space
var svgSpace= d3.select(".svg-container");

// add SVG canvas
var svgCanvas = svgSpace.append("svg:svg")
	.attr("class", "canvas")
	.attr("width", max_width)
	.attr("height", max_height);

// draw starting SVG
$(document).ready(function(){
	drawPolygon();
	addColorSelector();
});

var dragIt = d3.behavior.drag() // constructs a new drag behavior
	.origin(function(d) { return d; })
	.on("drag", dragmove) // event listener handling
	.on("dragend", updateNodeCoords); // event listener handling
			
// selects SVG drawing canvas, attaches nodes (circles) to the 
var node = svgCanvas.selectAll("circle")
		.data(nodeCoords)
		.enter()
		.append('circle')
			.attr("id", function(d) { return "node"+d.id; })
			.attr("class", "nodeStyle")
			.attr('cx', function(d) { return d.x; }) 
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.r; })
			.attr('fill', function(d) { return d.color; })
			.attr('opacity', function(d) { return d.o; })
			.call(dragIt)	// "call" a function passing in the current selection
			.style('cursor', 'pointer');

// function to move SVG to the back on mouseover event, allows user to click on nodes
d3.selection.prototype.moveToBack = function() { 
	//console.log("moveToBack");
	return this.each(function() { 
		var firstChild = this.parentNode.firstChild; 
		if (firstChild) { 
			this.parentNode.insertBefore(this, firstChild); 
		} 
	}); 
};

// accessor function to retrieve/return x and y coordinates from data
function drawPolygon() {
	//console.log("drawPolygon");
	// deletes existing SVG
	d3.select("path").remove();
		
	// D3 Path Line Generator, creates line using coordinates pulled below
	var squareFunctions = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("linear");		

	// redraw new SVG with updated coordinates
	var squareDraw = svgCanvas.append("path")
		.attr("d", squareFunctions(squareCoords))
		.attr("class", "originalPolygon")
		.attr("style", "fill:"+currentColor)
		.on("mouseover", function() { 
			d3.select(this).moveToBack(); // moves the SVG to the back
		});
	
	updateNodeCoordDisplay();
	
	// event listener for mouse click + SHIFT Key on the SVG path
	d3.select("path").on("click", addNode);
}

function updateNodeCoordDisplay() {
	var ul = document.getElementById("nodeCoords");
	// Remove all previous li elements
	while (ul.hasChildNodes()) {   
		ul.removeChild(ul.firstChild);
	}
	// Loop through each node to add coordinate listings
	for (i=0; i<nodeCoords.length; i++){
		// Create li element, set id and class
		var li = document.createElement("li");
		li.setAttribute("id","node"+i+"Input");
		li.setAttribute("class","coord-line");
		li.setAttribute("onmouseover", "hoverNode("+i+");");
		li.setAttribute("onmouseout", "unhoverNode("+i+");");
		
		// Append X section to li
		li.appendChild(document.createTextNode("X: "));
		// Create x input element with id, class, value, and onchange function
		var xInput = document.createElement("input");
		xInput.setAttribute("id","node"+i+"xInput");
		xInput.setAttribute("class","coord-input");
		xInput.setAttribute("value", convertPixToInch(nodeCoords[i].x));
		xInput.setAttribute("onchange", "updateNode("+i+", 'x');");
		// Append to li element
		li.appendChild(xInput);
		
		// Append Y section to li
		li.appendChild(document.createTextNode(" Y: "));
		// Create y input element with id, class, value, and onchange function
		var yInput = document.createElement("input");
		yInput.setAttribute("id","node"+i+"yInput");
		yInput.setAttribute("class","coord-input");
		yInput.setAttribute("value", convertPixToInch(nodeCoords[i].y));
		yInput.setAttribute("onchange", "updateNode("+i+", 'y');");
		// Append to li element
		li.appendChild(yInput);
		
		li.appendChild(document.createTextNode(" "));
		var deleteNodeButton = document.createElement("input");
		deleteNodeButton.setAttribute("type", "button");
		deleteNodeButton.setAttribute("value", "Delete");
		deleteNodeButton.setAttribute("onclick", "deleteNode("+i+")");
		
		li.appendChild(deleteNodeButton);
		
		// Append li to ul
		ul.appendChild(li);
		
		var newli = document.createElement("li");
		var newNodeButton = document.createElement("input");
		newNodeButton.setAttribute("type", "button");
		newNodeButton.setAttribute("value", "New Node");
		newNodeButton.setAttribute("onclick", "createNewNodeFromButton("+(i+1)+")");
		newNodeButton.setAttribute("onmouseover", "hoverNewNodeButton("+(i+1)+", 'nodeStyle-hover');");
		newNodeButton.setAttribute("onmouseout", "hoverNewNodeButton("+(i+1)+", 'nodeStyle');");
		ul.appendChild(newNodeButton);
	}
}

function updateNode(id, coord) {
	if (coord == 'x'){
		xValue = convertInchToPix(parseFloat($("#node"+id+"xInput").val()));
		if (xValue > max_width) {
			xValue = max_width;
		} else if (xValue < min_value) {
			xValue = min_value;
		}
		nodeCoords[id].x = xValue;
		squareCoords[id].x = xValue;
	} else {
		yValue = convertInchToPix(parseFloat($("#node"+id+"yInput").val()));
		if (yValue > max_height) {
			yValue = max_height;
		} else if (yValue < min_value) {
			yValue = min_value;
		}
		nodeCoords[id].y = yValue;
		squareCoords[id].y = yValue;
	}
	svgCanvas.selectAll("circle").remove();
	refreshSVG();
	drawPolygon();
}

function deleteNode(id) {
	nodeCoords.splice(id, 1);
	squareCoords.splice(id, 1);
	// Refresh ids
	for (i=0; i<nodeCoords.length; i++) {
		nodeCoords[i].id = i;
		squareCoords[i].id = i;
	}
	svgCanvas.selectAll("circle").remove();
	refreshSVG();
	drawPolygon();
}

function hoverNode(id) {
	var circle = document.getElementById("node"+id);
	circle.setAttribute("class", "nodeStyle-hover");
}

function unhoverNode(id) {
	var circle = document.getElementById("node"+id);
	circle.setAttribute("class", "nodeStyle");
}

function hoverNewNodeButton(id, className) {
	var previousNodeId = id-1;
	var nextNodeId;
	if (id == nodeCoords.length) {
		nextNodeId = 0;
	} else {
		nextNodeId = id;
	}
	var circle1 = document.getElementById("node"+previousNodeId);
	var circle2 = document.getElementById("node"+nextNodeId);
	circle1.setAttribute("class", className);
	circle2.setAttribute("class", className);
}

function convertPixToInch(pixelValue) {
	return pixelValue / conversion_value;
}

function convertInchToPix(inchValue) {
	return inchValue * conversion_value;
}

function addNode(d) {
	if (d3.event.shiftKey) {
		var point = d3.mouse(this);
		var p = {x: point[0], y: point[1] }; // stores mouse coordinates
		
		// create new node object
		newNode = { 
			"id": id,
			"color": "black",
			"x": p.x,
			"y": p.y,
			"r": 5,
			"o": 1
		}
		newSquareCoord = { 
			"id": id++,
			"x": p.x,
			"y": p.y
		}
		
		// pushes new node object to nodeCoords dataset
		addNewNode(newNode, newSquareCoord);
		//nodeCoords.push(newNode);
		//squareCoords.push(newSquareCoord);
		svgCanvas.selectAll("circle").remove();
		
		refreshSVG();
		drawPolygon();
	}
}

function createNewNodeFromButton(location) {
	// Called when user clicks 'New Node' button from Node Coordinates display
	// Create new node inbetween location-1 and location
	var newNodeCoords = [];
	var newSquareNodeCoords = [];
	var previousNodeId = location-1;
	var nextNodeId;
	if (location == nodeCoords.length) {
		nextNodeId = 0;
	} else {
		nextNodeId = location;
	}
	//console.log("Previous Node Id: "+previousNodeId+" | Next Node Id: "+nextNodeId);
	var newX = findMid(nodeCoords[previousNodeId].x, nodeCoords[nextNodeId].x);
	var newY = findMid(nodeCoords[previousNodeId].y, nodeCoords[nextNodeId].y);
	//console.log("New node x: "+newX+" y: "+newY);
	var newNode = { 
			"id": location,
			"color": "black",
			"x": newX,
			"y": newY,
			"r": 5,
			"o": 1
		}
	var newSquareCoord = { 
			"id": location,
			"x": newX,
			"y": newY
		}
	updateNodeArrays(location, newNodeCoords, newSquareNodeCoords, newNode, newSquareCoord);
	
	svgCanvas.selectAll("circle").remove();
	refreshSVG();
	drawPolygon();
}

function updateNodeArrays(newNodeId, newNodeCoords, newSquareNodeCoords, newNode, newSquareCoord) {
	//console.log("Location: "+newNodeId+" | ArrayLength: "+nodeCoords.length);
	for (i=0; i<nodeCoords.length; i++) {
		if (newNodeId > i){
			newNodeCoords[i] = nodeCoords[i];
			newNodeCoords[i].id = i;
			newSquareNodeCoords[i] = squareCoords[i];
			newSquareNodeCoords[i].id = i;
		} else if (newNodeId == i) {
			newNodeCoords[i] = newNode;
			newNodeCoords[i+1] = nodeCoords[i];
			newNodeCoords[i].id = i;
			newNodeCoords[i+1].id = i+1;
			
			newSquareNodeCoords[i] = newSquareCoord;
			newSquareNodeCoords[i+1] = squareCoords[i];
			newSquareNodeCoords[i].id = i;
			newSquareNodeCoords[i+1].id = i+1;
		} else {
			newNodeCoords[i+1] = nodeCoords[i];
			newNodeCoords[i+1].id = i+1;
			newSquareNodeCoords[i+1] = squareCoords[i];
			newSquareNodeCoords[i+1].id = i+1;
		}
	}
	if (newNodeId == nodeCoords.length) {
		newNodeCoords.push(newNode);
		newSquareNodeCoords.push(newSquareCoord);
	}
	// Update nodeCoords to new array list
	for (i=0; i<newNodeCoords.length; i++) {
		nodeCoords[i] = newNodeCoords[i];
		squareCoords[i] = newSquareNodeCoords[i];
	}
}

// dragmove selects only values associated with selected node,
// creates boundaries for drag event (specific only for square SVG)
function dragmove(d) {
	d3.select(this)
		.attr("cx", d.x = Math.max(0, Math.min(max_width, d3.event.x)))
		.attr("cy", d.y = Math.max(0, Math.min(max_height, d3.event.y)));
}

function addNewNode(newNode, newSquareCoord){
	// New array list for nodes
	var newNodeCoords = [];
	var newSquareNodeCoords = [];
	var distance = 100000;
	var closestId;
	var nextClosestId;
	var newNodeId;
	
	// Loop through each current node in nodeCoords and store closest id
	for (i=0; i<nodeCoords.length; i++) {
		newDistance = getDistance(newNode.x, newNode.y, nodeCoords[i].x, nodeCoords[i].y);
		//console.log("Distance between newNode and node["+i+"] = "+newDistance);
		if (newDistance < distance){
			distance = newDistance;
			closestId = i;
		}
	}
	
	//console.log("ClosestId - "+closestId);
	
	// Find closest from among previous and next of closest id
	var previousNode;
	var nextNode;
	
	if (closestId == 0){
		previousNode = nodeCoords[nodeCoords.length-1];
	} else {
		previousNode = nodeCoords[closestId-1];
	}
	if (closestId == nodeCoords.length-1) {
		nextNode = nodeCoords[0];
	} else {
		nextNode = nodeCoords[closestId+1];
	}
	
	//console.log("PreviousNode - "+previousNode.id);
	//console.log("NextNode - "+nextNode.id);
	
	if (getDistance(newNode.x, newNode.y, previousNode.x, previousNode.y) < 
			getDistance(newNode.x, newNode.y, nextNode.x, nextNode.y)) {
		// previous less than next, in-between closestId-1 - closestId
		newNodeId = closestId;
	} else {
		// next less than previous, in-between closestId - closestId+1
		newNodeId = closestId+1;
	}
	
	//console.log("New node id: "+newNodeId);
	
	// New node goes in-between closest and next closest, reorder into new array
	updateNodeArrays(newNodeId, newNodeCoords, newSquareNodeCoords, newNode, newSquareCoord);
}

// Use distance formula to get distance between 2 points
// sqrt((x2-x1)^2+(y2-y1)^2)
function getDistance(x1, y1, x2, y2) {
	var xs = 0;
	var ys = 0;
	
	xs = x2 - x1;
	xs = xs * xs;
	
	ys = y2 - y1;
	ys = ys* ys;
	
	return Math.sqrt(xs + ys);
}

function findMid(p1, p2) {
	//console.log("Find mid between "+p1+" - "+p2);
	return (p1 + p2) / 2;
}

// redraws the circle nodes
function refreshSVG() {
	//console.log("refreshSVG");
	svgCanvas.selectAll("circle")
		.data(nodeCoords)
		.enter()
		.append('circle')
			.attr("id", function(d) { return "node"+d.id; })
			.attr("class", "nodeStyle")
			.attr('cx', function(d) { return d.x; }) 
			.attr('cy', function(d) { return d.y; })
			.attr('r', function(d) { return d.r; })
			.attr('fill', function(d) { return d.color; })
			.attr('opacity', function(d) { return d.o; })
			.call(dragIt)
			.style('cursor', 'pointer');								
}

// function stores mouse coordinates for dragged node, reassigns (cx, cy) attributes in nodeCoords dataset
function updateNodeCoords(d) {
	var nodeId = d.id; // retrieves "id" of dragged node object
	//console.log("NodeId: "+nodeId);
	var point = d3.mouse(this); // retrieves x, y coords of mouse coordinate
	var p = {x: point[0], y: point[1] } // assigns value[0] to x, value[1] to y

	// if node is dragged outside of SVG path, send error message and update the SVG path
	if (p.x > max_width || p.x < 0 || p.y > max_height || p.y < 0) {
		//alert("You cannot go outside"); 
		updateSquareCoords();
	}
	else { 
		// updates nodeCoord x,y values to corresponding id
		nodeCoords[nodeId].x = p.x;
		nodeCoords[nodeId].y = p.y;
		updateSquareCoords();
	}
}

// function updates the SVG path based on nodeCoords 
function updateSquareCoords() {
	//console.log("you're in updatesquarecoords");
	for (node = 0; node < nodeCoords.length; node++) {
		squareCoords[node].x = nodeCoords[node].x;
		squareCoords[node].y = nodeCoords[node].y;
	}
	
	// redraw polygon
	drawPolygon();
}

function addColorSelector() {
	var span = document.getElementById("color-grid");
	for (i=0;i<colors.length;i++) {
		var a = document.createElement("a");
		a.setAttribute("class","colorBox");
		a.setAttribute("style","background-color:"+colors[i]);
		a.setAttribute("title", colors[i]);
		a.setAttribute("onclick", "changeColor('"+colors[i]+"');");
		span.appendChild(a);
	}
}

function changeColor(color) {
	$(".originalPolygon").attr('style', "fill:"+color);
	currentColor = color;
}

function exportImage() {
	var canvas = prepareForDraw();
	var a = document.createElement('a');
	a.download = "image.png";
	a.href = canvas.toDataURL('image/png');
	document.body.appendChild(a);
	a.click();
}

function openImage() {
	var canvas = prepareForDraw();
	window.open(canvas.toDataURL('image/png'));
}

function prepareForDraw() {
	clearCircles(true);
	
	var svg = d3.select("svg")[0][0],
		img = new Image(),
		serializer = new XMLSerializer(),
		svgStr = serializer.serializeToString(svg);
	
	img.src = "data:image/svg+xml;utf8," + svgStr;

	var canvas = document.createElement("canvas");

	canvas.width = max_width;
	canvas.height = max_height;
	canvas.getContext("2d").fillStyle=currentColor;
	canvas.getContext("2d").drawImage(img,0,0,max_width,max_height);
	clearCircles(false);
	return canvas;
}

function clearCircles(c) {
	//console.log("ClearCircles");
	for (i=0; i<nodeCoords.length; i++) {
		if (c) {
			nodeCoords[i].o = "0";
		} else {
			nodeCoords[i].o = "1";
		}
		console.log("Setting node "+i+" opacity to "+nodeCoords[i].o);
	}
	svgCanvas.selectAll("circle").remove();
	refreshSVG();
	drawPolygon();
}

function generateGCode() {
	var gcode = createGCode(true);
	
	$("#gcode").html(gcode);
	$("#gcode-section").show();
}

function exportGCode() {
	var gcode = createGCode(false);
	
	var a = document.createElement('a');
	a.download = "image.gcode";
	a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(gcode)
	//document.body.appendChild(a);
	a.click();
}

function createGCode(isHTML){
	var gcode = "";
	var lineBreak = "\n";
	if (isHTML){
		lineBreak = "<br>";
	}
	// Initial line 
	gcode = "G00 X"+convertPixToInch(nodeCoords[0].x)+" Y"+convertPixToInch(nodeCoords[0].y)+" Z"+initialZClearance+lineBreak;
	// Move to cut depth
	gcode += "G01 Z"+cutDepth+" F"+IPM+lineBreak;
	// Loop through coords and update gcode
	for (var i=1; i<nodeCoords.length; i++) {
		gcode += "X"+convertPixToInch(nodeCoords[i].x)+" Y"+convertPixToInch(nodeCoords[i].y)+lineBreak;
	}
	// Move back to start
	gcode += "X"+convertPixToInch(nodeCoords[0].x)+" Y"+convertPixToInch(nodeCoords[0].y)+lineBreak;
	// Move out of cut depth
	gcode += "G00 Z"+initialZClearance+lineBreak;
	
	return gcode;
}

function clearGCode() {
	$("#gcode-section").hide();
}
			