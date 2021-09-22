# import required libraries
import os
from flask import Flask, render_template, request, jsonify
import fitz

# spacy text processing
import spacy

#load core english library
nlp = spacy.load("en_core_web_sm")  

# init flask  app
app = Flask(__name__)

# path to pdf files
tmppdf_filename = 'static/uploads/tmp.pdf'
tmphilitepdf_filename = 'static/uploads/tmp_highlighted.pdf'


@app.route('/upload', methods=['POST', 'GET'])
def upload_file():
    """ Upload and store PDF file in a predefined path (this is a PoC working with single document at this time)
    """
    if request.method == 'POST':
        f = request.files['the_file']
        f.save(tmppdf_filename)
    return tmppdf_filename


@app.route('/extract_sentences')
def extract_sentences():
    """ Extract sentences from PDF document
    """

    # load pdf document
    doc = fitz.open(tmppdf_filename)

    # this hold values to be returned
    sentences = []

    # page number (counter)
    page_num = 0

    # process each page from pdf
    for page in doc:

        # new page
        page_num = page_num + 1

        # clean the document a bit (1. line continuation and 2. line breaks)
        page_text = page.get_text('text')
        page_text = page_text.replace('-\n', '')
        page_text = page_text.replace('\n', ' ')

        # pass page_text for natural language processing library
        doc = nlp(page_text)

        # to get extracted sentences
        for sent in doc.sents:
            sentences.append({
                'page_num': page_num,
                'sentence': str(sent),
            })

    return jsonify(sentences)


@app.route('/highlight_sentences', methods=['POST'])
def highlight_sentences():
    sentences = request.get_json()

    # load highlightable pdf document
    doc = fitz.open(tmppdf_filename)

    # process each sentence
    for sentence in sentences:

        # search sentence in page
        for page in doc:

            # search text
            text = sentence['sentence']
            text_instances = page.searchFor(text)

            print('text', text)

            # highlight
            for inst in text_instances:
                highlight = page.addHighlightAnnot(inst)
                highlight.update()

    # save highlighted
    if os.path.exists(tmphilitepdf_filename):
        os.remove(tmphilitepdf_filename)
    doc.save(tmphilitepdf_filename, garbage=4, deflate=True, clean=True)

    return 'OK'


@app.route("/")
def index():
    """ Render the index template
    """
    return render_template('index.html')


