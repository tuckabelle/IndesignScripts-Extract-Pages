/* 
This script initiates a palette that extracts pages from a document and saves them as new, separate files in the location chosen by the user. The user can name the files either via GREP or individually.
The original document remains the same.

Author: Tucker Harris
https://github.com/tuckabelle/IndesignScripts-Extract-Pages/new/indesign-extractPages.js
*/

#targetengine "session";
var myDoc = app.activeDocument;
var myPages = app.activeDocument.pages;

// Create a list of paragraph styles
myStyles = app.activeDocument.allParagraphStyles;
var myarray = [];
for (i = 0; i < myStyles.length; i++) {
	myarray.push(get_path(myStyles[i], myStyles[i].name));
	if (myStyles[i].parent.constructor.name == "ParagraphStyleGroup") myarray[i] += " [" + myStyles[i].parent.name + "]";
}

var w = new Window("palette", "Extract Pages");
app.activate();
w.alignChildren = "left";

// Radio Group 1  ------------------------------------------------------
var radio_group1 = w.add("group");
var radioStyles = radio_group1.add("radiobutton", undefined, "Name pages with GREP");

var byStyle = w.add("group");
byStyle.alignChildren = "left";
byStyle.orientation = "column";
byStyle.margins = [30, 0, 0, 20];
var FontDropdownGroup = byStyle.add("group");
FontDropdownGroup.add("statictext", undefined, "Paragraph Style: ");
var FontDropdown = FontDropdownGroup.add("dropdownlist", undefined, myarray);
FontDropdown.selection = 0;

var grep_group = byStyle.add("group");
grep_group.add("statictext", undefined, "GREP: ");
var grep = grep_group.add('edittext {characters: 25, text: "(?<=,.)\d[^$]+?(!?$)|(?<=,.)L\.[^$]+?(!?$)|(?<=,.)L\d[^$]+?(!?$)"}');
var checkGrep = grep_group.add("button", undefined, "\u2713");
checkGrep.addEventListener("click", function () {
	check(checkGrep.text)
});
checkGrep.preferredSize = [20, 20];
var clearGrep = grep_group.add("button", undefined, "\u2715");
clearGrep.addEventListener("click", function () {
	clear(checkGrep.text)
});
clearGrep.preferredSize = [20, 20];


// Radio Group 2  ------------------------------------------------------
var radio_group2 = w.add("group");
var radioType = radio_group2.add("radiobutton", undefined, "Name pages individually");


// Choose Folder  ------------------------------------------------------
var line = w.add("panel", [0, 0, 300, 2]);
line.alignment = 'center';

var folder_group = w.add('group');
folder_group.add("statictext", undefined, "Output Folder: ");
var outfolder = folder_group.add('edittext {characters: 25}');
var pick_button = folder_group.add('iconbutton', undefined, folder_icon(), {
	style: 'toolbutton'
});

pick_button.onClick = function () {
	var f = Folder(outfolder.text).selectDlg('Choose a folder')
	if (f != null) {
		outfolder.text = f.fullName + '/';
	}
}
outfolder.onDeactivate = function () {
	if (outfolder.text !== "" && !Folder(outfolder.text).exists) {
		outfolder.text = folder.text += " does not exist";
		w.layout.layout();
		outfolder.active = true;
	} else
	if (outfolder.text !== "" && outfolder.text.slice(-1) !== "/") outfolder.text += "/";
}

// Keywords  ------------------------------------------------------

var keyword_group = w.add('group');
keyword_group.add("statictext", undefined, "Keywords: ");
var keyGroup = keyword_group.add('edittext {characters: 25}');

// Extact Button  ------------------------------------------------------
var line2 = w.add("panel", [0, 0, 0, 0]);
line2.alignment = 'center';
var buttonExtract = w.add("button", undefined, "Extract Pages");
buttonExtract.addEventListener("click", function () {
	extract(checkGrep.text)
});
buttonExtract.alignment = 'right';



// Radio Event Listeners and GREP Functions ------------------------------------------------------
radio_group1.children[0].value = true;

radio_group1.addEventListener("click", function () {
	for (var i = 0; i < radio_group2.children.length; i++)
		radio_group2.children[i].value = false;
});
radio_group2.addEventListener("click", function () {
	for (var i = 0; i < radio_group1.children.length; i++)
		radio_group1.children[i].value = false;
});

function check(p) {
	app.activate();

	var grepPhrase = String(grep.text);
	var FontName = String(FontDropdown.selection);
	var doc = app.activeDocument;
	try {
		highlight_grep(doc, FontName, grepPhrase)
	} catch (e) {
		alert("Oops! Please input a GREP phrase.")
	};
	app.documents[0].layoutWindows[0].screenMode = ScreenModeOptions.previewOff;

	function highlight_grep(doc, FontName, grepPhrase) {
		var highlightCondition = check_condition(doc, 'HightlightGrep');
		app.findGrepPreferences = app.changeGrepPreferences = null;
		app.findGrepPreferences.findWhat = String(grepPhrase);
		if (FontName != "[No Paragraph Style]") {
			app.findGrepPreferences.appliedParagraphStyle = String(FontName);
		}
		app.changeGrepPreferences.appliedConditions = [highlightCondition];

		doc.changeGrep();
	}

	function check_condition(doc, n) {
		// Delete condition if it exists
		if (doc.conditions.item(n) != null)
			doc.conditions.item(n).remove();
		doc.conditions.add({
			name: n,
			indicatorColor: [225, 225, 255],
			indicatorMethod: ConditionIndicatorMethod.useHighlight
		});
		return doc.conditions.item(n)
	}
}

function clear(p) {
	app.activate();
	var doc = app.activeDocument;
	if (doc.conditions.item("HightlightGrep") != null) {
		doc.conditions.item("HightlightGrep").remove();
	}
}


// EXTRACTING THE PAGES ------------------------------------------------------

function extract() {
	clear();
	var myPages = app.activeDocument.pages;
	var keyString = keyGroup.text
	if (keyString != "") {
		var keywordList = keyString.split(",");

		with(myDoc.metadataPreferences) {
			keywords = keywordList;
		}
	}
	var FontName = String(FontDropdown.selection);
	var grepPhrase = String(grep.text);


	// Radio1 ------------------------------------------------------
	if (radioStyles.value == true) {
		for (i = 0; i < myPages.length; i++) {
			var text = [];
			var currentPage = myPages[i];
			//var FontName = "Character Style 1";
			for (t = 0; t < currentPage.textFrames.length; t++) {
				var currentFrame = currentPage.textFrames[t];
				app.findGrepPreferences = null;
				app.changeGrepPreferences = null;
				app.findChangeGrepOptions.includeFootnotes = false;
				app.findChangeGrepOptions.includeHiddenLayers = false;
				app.findChangeGrepOptions.includeLockedLayersForFind = true;
				app.findChangeGrepOptions.includeLockedStoriesForFind = true;
				app.findChangeGrepOptions.includeMasterPages = true;

				//app.findGrepPreferences.findWhat = "(?<=,.)\d[^$]+?(!?$)|(?<=,.)L\.[^$]+?(!?$)|(?<=,.)L\d[^$]+?(!?$)";
				app.findGrepPreferences.findWhat = String(grepPhrase);
				app.findGrepPreferences.appliedParagraphStyle = FontName;

				var finds = currentFrame.findGrep();
				if (finds.length > 0) {

					for (var f = 0; f < finds.length; f++) {
						text.push(finds[f].contents);
					}
				}
			}

			var pageName = String(text.join(', '));

			if (pageName == "") {
				var pageName = String("NameError" + i);
			}

			var myFilePath = outfolder.text;
			var myFolder = (File(String(myFilePath))); // Create a new file path
			myDoc.saveACopy(File(myFolder + "/" + pageName + ".indd"));

			newDoc = app.open(File(myFolder + "/" + pageName + ".indd"), false);
			myDoc.pages[i].duplicate(LocationOptions.AT_END, newDoc.pages[-1]);
			newDoc.pages.itemByRange(newDoc.pages[0], newDoc.pages[-2]).remove();
			newDoc.close(SaveOptions.YES);
		}

		app.findGrepPreferences = app.changeGrepPreferences = null;



		// Radio2 ------------------------------------------------------
	} else if (radioType.value == true) {
		for (i = 0; i < myPages.length; i++) {
			var text = [];
			var currentPage = myPages[i];
			app.activeWindow.activePage = myPages[i];
			var myDialog = app.dialogs.add({
				name: "Extract Pages"
			});

			//Add a dialog column.
			with(myDialog.dialogColumns.add()) {
				staticTexts.add({
					staticLabel: "Page Name:",
				});
			}
			with(myDialog.dialogColumns.add()) {
				var pageNameBox = textEditboxes.add({
					minWidth: 250,

				});

			}
			var myResult = myDialog.show();
			if (myResult == true) {
				var pageName = String(pageNameBox.editContents);
				if (pageName == "") {
					var pageName = String("Page" + i);
				}

				var myFilePath = outfolder.text;
				var myFolder = (File(String(myFilePath))); // Create a new file path
				myDoc.saveACopy(File(myFolder + "/" + pageName + ".indd"));
				newDoc = app.open(File(myFolder + "/" + pageName + ".indd"), false);
				myDoc.pages[i].duplicate(LocationOptions.AT_END, newDoc.pages[-1]);
				newDoc.pages.itemByRange(newDoc.pages[0], newDoc.pages[-2]).remove();
				newDoc.close(SaveOptions.YES);
				myDialog.destroy();

			} else {
				myDialog.destroy();
			}
		}
	}
}

function get_path(style, style_name) {
	while (style.parent.constructor.name != 'Document')
		return get_path(style.parent, style.parent.name + ' > ' + style_name);
	return style_name;
}

function folder_icon() {
	return "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x16\x00\x00\x00\x12\b\x06\x00\x00\x00_%.-\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008E|\u00FBQ\u0093\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\x02\u00DEIDATx\u00DAb\u00FC\u00FF\u00FF?\x03-\x00@\x0011\u00D0\b\x00\x04\x10\u00CD\f\x06\b \x16\x18CFR\x12L\u00CF*\u0092e\u00FE\u00F7\u009F!\u008C\u0097\u008By\x19\u0088\u00FF\u00F7\u00EF\x7F\u0086\u00CF\u00DF\u00FE\u00C6dOz\u00B2\x1C\u00C8\u00FD\x0F\u00C5\x04\x01@\x00\u00A1\u00B8\x18f(##C\u00AD\u009Ak9\u0083\u008E_\x17\u0083i\u00D4<\x06\x16f\u00C6\u009A\t\u00D9\u00D21@%\u00CC@\u00CCH\u008C\u00C1\x00\x01\u00C4\b\u008B<\u0090\u008Bg\x14\u00CAF212,\u00D3q\u00CDb\u00E0\x16Rf`\u00E3\x14f`\u00E5\x14d\u00F8\u00FF\u00E7'\u00C3\u00FE\u00D9a\x18\u009A\u00FF\u00FE\u00FB\u009Fq\u00F3\u00F1\u00CF%\x13\u00D6\u00BE\u00FE\u0086\u00EE\x13\u0080\x00bA\u00B6\x04d\u00A8\u00A1_\x15\u00D8@\u0098\u00A1\u00AC\u00EC\u00FC\f\u00CC<\\\f^\u00A5\u00A7P\f\u00FD\u00F6\u00EE.\u00C3\u00DD\x03\x1D3\u00BE\u00FF<\u00FF\f\u00C8\u00DD\x01\u00C4\x7F\u0090\r\x07\b \x14\u0083A\x04\u00CCP6\x0E!\u0086\u00A3s\x03\x18XY\x19\x19\u00FE\x01\u00C3\x07\x14\u00D6\x7F\u00A1\u00F4\u009F\u00BF\f`\fb\x03}\u00BC\u00A9+U\u0092\u00E1\u00F9\u009B\u00BF\u00BA\u00FD\u00EB_]\u0083\u00C5\x03@\x00\u00B1\u00A0\u00877\u00CC\u00A5\u00F7\x0F\u00F72\u00C8\x1B\x052p\n(\u0080\u00A5\u00FE\u00FD\u00F9\u00C5\u00F0\u00F7\u00F7o\u0086?\u00BF\x7F1\u00FC\u00F9\x05\u00A1\u00FF\u00FE\u00F9\r\u00C6\u009F\u009E_\x00\u00C6\u00C3\u00FDI@\u0085^@\u00FC\x1B\x14J\x00\x01\u00C4\u0084\u00EEb\u0090\u00A1\u00BF>\u00BFd\u00F8\u00FC\u00EA:\x03\u00A7\u00A0\"\u00C3\u00BF\u00BF\u00BF\x19\u00FE\u00FF\u00FD\x034\u00F8\x0F\u00D8\u0090\x7F\u00BFAl \u00FD\u00EF/P\u00EE\x0FX\u00FE\u00C0\u00B1+\f\u008F^\u00FD<\b\u00D4\u00CE\x01\u008B`\u0080\x00\u00C2\b\n\x0E\x1EI\u0086\u009B\u00DB\u00CA\x19\u0084\u0094\u00EC\u0081\u0081\u00CE\u00CA\u00C0\u00C4\x04\u00F4\u00FE\u00AF_`\u0083A\u0086\u0082]\u00F9\x17j8\u0090\u00FE\u00F1\u00E9)\u00C3\u00D6\x13/\x19\u00EE\u00BFa\u00D8\u00C2\u00CE\u00C6\u00CE\n5\u00F8\x0F@\x00ad\u0090W7\u00B60\u00FC\u00FB\u00FF\u0087\u0081KX\x05\u00E8\u00D2\u00DF`\x03\u00FE\u0082]\x0Bq\u00DD\u00BF\u00BF0\u0097\u00FE\x05\u0086\u00EF_\u0086\u00C3G\u008E1\u00DCy\u00FE}9\u00D0\u00D0O\u00C8I\x11 \u00800\f~xr\x06\u0083\u00A0\u00825\u00C3\u00FF\x7FPW\x01\r\x04Y\x00q\u00E9_ \u0086\x1A\x0E\u0094\u00FF\t\f\u00B2\u0095\u00FB\u009F20\u00B3p\u00CC\u0082\u00A6\n\x10\u00FE\x07\u008A<\u0080\x00\u00C20\u0098\u009DO\u0082\u0081\u009DG\x02\x12\u00AE@\u00CD \u0083\u00C0^\x07bP\u00E4\u00FD\u0083\x1A\u00FE\x1F\u00E8\u00ABS'\u008F2\u00DC{\u00FE}\x1D;;\u00C7\x0B\u00A0\u00D6\u009F@\u00FC\x0B\x14q \u0083\x01\x02\u0088\x05\u00C5P6&\u0086\u00F6i\u00DB\x18^\u00BE[\x0FNJ\u00BF\u00FF\u00FCc\x00&\x00\u0086\u00DF\u00BF!l`\x10\x03\u0093\u00D9\x7F0\u00FE\x0B\u00CCX\u00DF\x7F\u00FEe`e\u00E3\u009C\t5\u00F0'\u0092\u008B\x19\x00\x02\b9\u00E7\u0081\x02\u009E\x0B\u0088\u00F9\u00A14+\x119\u00F7\x1F\u00D4\u00D0/P\u00FC\x1Dj8\x03@\x00!\u00BB\u00F8?T\u00F0'\u0096\u00CCC\u00C8\u00E0\u00EFP\u00FA\x1FL\x02 \u0080X\u00D0\x14\u00FD\u0086\u00DA\u00FC\u0083\u00C8\"\x15\u00E6\u0098\u00DF\u00C8\u00C1\x00\x02\x00\x01\x06\x000\u00B2{\u009A\u00B3\x1C#o\x00\x00\x00\x00IEND\u00AEB`\u0082";
}
w.show();