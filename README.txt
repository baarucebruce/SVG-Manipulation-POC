README

The SVG 2D Modeling Proof of Concept (POC) was developed to fulfill the following business requirements:

	- Present a web visual that presents to the user a sheet of metal in the form of a shape (SVG)
	- User is able to manipulate the sheet to customize its shape
	- User can save the sheet/shape as a .PNG file for representational purposes
	- User can transcribe the sheet/shape to a GCODE file that is read by CNC Routers
	- User can precisely create nodes that provides precise adjustments
	
Things to do:
	- Does using sublime or Eclipse serve as more efficient workspace?
	- Update filepaths
		- File structure from SVN includes /svg/ filepath preceding the usable files
			i.e. /css/svg/svgd3.css; /js/svg/main.js
		- Local file structure omits the /svg/ filepath
			i.e. /css/svgd3.css; /js/main.js
	- Convert .jsp files into .html (?)
		- Define what is required to render .jsp in offline/local/in a browser
		- HTML equivalent of 'dsp:include'
		- 'dsp:page' equivalent? necessary? (this applies to svg.jsp > main.jsp)
		- In svg.jsp, use of custom tags
			- i.e. <vsg:sketch></vsg:sketch>
				- Where does object:property relationship go to?
	- Define directory/filepath to save/export .PNG files, .SVG files, GCODE files
	- Find out best place to import .js files
		- jQuery
		- /js/main.js

	- Can I build a simple VM or use an existing VM to run this application?


	
