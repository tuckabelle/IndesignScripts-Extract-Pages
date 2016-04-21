# IndesignScripts-Extract-Pages
Extract pages from an InDesign document, naming and saving each as a separate document.
When creating a batch of labels, it’s easier to design all of them on one large document. However, dividing those labels into separate documents and naming each file can get a little convoluted. This is a script helps with that process! Plus you keep the original document in tact.

###Let’s take a look at the options:
The first choice to make: do you want the script to name the page automatically, or do you want to name each page yourself?

![screen shot 2016-04-19 at 3 26 52 pm](https://cloud.githubusercontent.com/assets/13002217/14720153/0151d39e-07ce-11e6-8b87-616be110d9ac.png)

######NAME PAGES WITH GREP:

1. This first dropdown pulls up all of the paragraph styles in the document. I, for this example, am naming my pages after a unique number given to each artwork. This number is always located in a Paragraph Style I have named in some variation of “donor”. In selecting it, the script will only look in the “donor" paragraphs for the number I seek. Choosing a Paragraph Style is optional. If no style is chosen, the script will run on the entire page, sifting through all paragraph styles.

2. Enter a GREP phrase that will locate the the would-be name. Beside the text box, there are two buttons:

- **The check mark**: when pressed, the script will search in the Paragraph Style selected and highlight the words/numbers indicated by the GREP phrase. This is a way of testing your GREP to make sure it is accurate. The script does this by creating and applying a condition, and you can witness its existence if you pull up the Conditional Text palette (Window > Type & Tables > Conditional Text). Note that the script automatically changes the Screen Mode to “normal”, because the highlights will not be seen in “preview” mode. You may enter another phrase and run the test again or…

- **The X mark**: when clicked, the script will remove the Condition, and thus remove the highlight.

---

######NAME PAGES INDIVIDUALLY:
This radio button indicates that you would rather name each page individually. Once you finish filling out the rest of the form, a window will appear appear with a text box for you to enter in the name of Page 1. Once you press OK, another window will appear for you to enter in the name of Page 2, etc. If you leave the text box blank and click OK, it will automatically be renamed “Page” + page number. If you click “Cancel”, that page will not be duplicated. 

![screen shot 2016-04-21 at 1 51 40 pm](https://cloud.githubusercontent.com/assets/13002217/14720171/22300022-07ce-11e6-9298-d58404511969.png)

---

###The next steps
######OUTPUT FOLDER:
By clicking on the folder icon, you can choose the folder in which you wish to place the documents.

######KEYWORDS:
If you want all of the documents to have the same keywords logged in the metadata, enter them in here. Make sure to divide the words/phrases with commas. This is optional.

######A few notes:
If the script has trouble locating a phrase on a page for some reason, it will name the page “NameError” + the page number where the error occurred. In this way, the error will not stop the rest of the pages from being named and saved.

Also, if there are several occurrences of the paragraph style + GREP phrase, the script to combine the various instances into one name. For example, if I need one label to represent two works of art, and thus it has two numbers in separate places, the file name would look something 89.456, 2001.24.indd

I hope this is a useful script for some folks out there. Let me know if you find any issues or request extra functionality.

