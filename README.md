# charming
A Python parser for Exalted 3e charm pdfs, and an HTML/JS charm creator. The charm data is not included for obvious copyright reasons. If you're from White Wolf Publishing and would like to see this in action, please get in touch!

This is really split into two parts, and I suppose I could make two repositories, but they're pretty intertwined, so I decided to leave it as one.

PART 1: Getting the data with Python.

Exalted 3rd Edition is a tabletop roleplaying game. In that game every character gets spell-like abilities called 'charms.' There are nearly 800 ability charms in the core book. It's a mess trying to findt he one you want, and worse to maek reference cards for all of them. Especially since each character gets about 10 charms which they have to wade through those 800 to find. 

And so my journey began. 

There are official PDFs with cards for those 800 ability charms. These PDFs are availible from DriveThru RPG. 

My initial thought was that I could just convert those to pngs and chop them up into usable cards, using some OCR to get charm names. 

However, while looking at the PDFs with Python I realized that the HTML output was actually not *too* bad. There were problems with some things not being in order or the like, and more than a few typos, but for the most part it was quite usable. 

charm_pdfs_to_html.py:

This script uses the tika library and takes all of the pdf files in /pdfs/ and tries to turn them into one large html file. You'll need the official charm PDFs for this to work.

parse_charm_html.py:

This file uses BeautifulSoup to parse the HTML file created from charm_pdfs_to_html.py into individual charms, then stores those charms in a json file called 'charms.json'

That json file leads us into part 2.

PART 2: Searching, Making, and Printing

NOTE: You can't open the html file locally and hope for it to work. I'm loading the json file with AJAX, as I couldn't find other ways to get it to work. I'm open to suggestion here! 

Once I had the card data I needed a way to display and print thoes cards out. HTML and JavaScript were the obvious choice, asn broswers can handle formatting and printing with relative ease. 

The javascript grabs the json file with a bit of AJAX, so you'll need to actually open index.html from a server to get it to work. 

There's a navigation section at the top of the page that allows you to search for charms in various ways. You can select a charm and modify its contents, then you can add that charm to the page.

Once you have all your charms you can simply print them fron the browser. This page is designed to print nine charms per page. 
