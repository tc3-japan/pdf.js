if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/static/pdfjs-dist/build/pdf.worker.js";
// Some PDFs need external cmaps.
const CMAP_URL = "/static/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;
const container = document.getElementById("viewerContainer");
const eventBus = new pdfjsViewer.EventBus();
const pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  scale: 0.5,
});
eventBus.on("pagesinit", function () {
  pdfViewer.currentScaleValue = 1;
});
// Add event listener
let btn = document.getElementById("search");
btn.addEventListener("click", on_search_click, false);
let viewer = document.getElementById("viewer");
viewer.addEventListener("mouseup", on_mouse_up);

function on_mouse_up(event) {
  console.log("on_mouse_up in");
  console.log(event);
  console.log(event.srcElement.textContent);
  event.srcElement.style.backgroundColor = '#f00';
  var sentence = event.srcElement.textContent;
  if (sentence == "") return;

  var previous_element = get_previous_element(event.srcElement.previousElementSibling);
  if (previous_element != null) {
    while (previous_element != null) {
      let previous_word = previous_element.textContent;
      if (previous_word.indexOf('.') > -1 || previous_word.indexOf('?') > -1 || previous_word.indexOf('!') > -1) {
        previous_element = null;
      } else {
        sentence = previous_word + sentence;
        previous_element.style.backgroundColor = '#f00';
          // null is no more next element;
        previous_element = get_previous_element(previous_element);
      }
    }
  }

  var next_element = get_next_element(event.srcElement.nextElementSibling);
  if (next_element != null) {
    next_element.style.backgroundColor = '#f00';
    while (next_element != null) {
      let next_word = next_element.textContent;
      sentence += next_word;
      next_element.style.backgroundColor = '#f00';
      if (next_word.indexOf('.') > -1 || next_word.indexOf('?') > -1 || next_word.indexOf('!') > -1) {
        next_element = null;
      } else {
        // null is no more next element;
        next_element = get_next_element(next_element);
      }
    }
  }

  console.log("sentence: " + sentence);

  spacy_sentence = null;

  if (sentences != null) {
    sentences.forEach(function(element){
      //console.log(element.sentence);
      
      if (element.sentence.replace(" ", "").indexOf(sentence.replace("- ", "").replace(" ", "")) > -1) {
        spacy_sentence = element.sentence;
        console.log("sentence found.");
        return false;
      }
    });
  }

  if (spacy_sentence != null) {
    console.log("found spacy sentence: " + spacy_sentence);
  }

  console.log("on_mouse_up end");
}

function get_next_element(nextElementSibling) {
  if (nextElementSibling != null) {
    return nextElementSibling.nextElementSibling;
  }
}

function get_previous_element(previousElementSibling) {
  if (previousElementSibling != null) {
    return previousElementSibling.previousElementSibling;
  }
}

function on_search_click() {
  console.log("call on_search_click");
  let word = document.getElementById("search_word").value;

  var span = document.querySelectorAll('div.textLayer > span');
  var forEach = Array.prototype.forEach;
  forEach.call(span, function (elem) {
    let text = elem.textContent;
    if (text.includes(word) && word != "") {
      console.log(text);
      elem.style.backgroundColor = '#f00';
    } else {
      elem.style.backgroundColor = '';
    }
  });

  /*
  var forEach = Array.prototype.forEach;
  forEach.call(sentences, function (elem) {
    text = elem.sentence;
    if (text.includes(word) && word != "") {
      console.log("SpaCy sentence: " + text);
    }
  });
  */

  /*
  var forEach = Array.prototype.forEach;

  var span = document.querySelectorAll('div.textLayer > span');
  forEach.call(span, function (elem) {
    console.log(elem);
    var previous_element = get_previous_element(elem.srcElement.previousElementSibling);
    if (previous_element != null) {
      while (previous_element != null) {
        let previous_word = previous_element.textContent;
        if (previous_word.indexOf('.') > -1 || previous_word.indexOf('?') > -1 || previous_word.indexOf('!') > -1) {
          previous_element = null;
        } else {
          sentence = previous_word + sentence;
          previous_element.style.backgroundColor = '#f00';
            // null is no more next element;
          previous_element = get_previous_element(previous_element);
        }
      }
    }

    var next_element = get_next_element(elem.srcElement.nextElementSibling);
    if (next_element != null) {
      next_element.style.backgroundColor = '#f00';
      while (next_element != null) {
        let next_word = next_element.textContent;
        sentence += next_word;
        next_element.style.backgroundColor = '#f00';
        if (next_word.indexOf('.') > -1 || next_word.indexOf('?') > -1 || next_word.indexOf('!') > -1) {
          next_element = null;
        } else {
          // null is no more next element;
          next_element = get_next_element(next_element);
        }
      }
    }

    text = elem.textContent;
    if (text.includes(word) && word != "") {
      console.log(text);
      elem.style.backgroundColor = '#f00';
    } else {
      elem.style.backgroundColor = '';
    }*/
}

// the remote pdf file url
var pdf_url = '../uploads/tmp.pdf';
var hilitepdf_url = '../uploads/tmp_highlighted.pdf';

// reference to currently viewed PDF document sentences
var sentences = null;

// reference to matched sentences
var matchedSentences = [];

$.extend({
    /**
     * file upload event handler, upload file to /upload POST method
     */
    uploadFile: function (e) {

        console.log(this.files);

        let file = this.files[0];

        var uploadUrl = '/upload';
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        xhr.open("POST", uploadUrl, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Every thing ok, file uploaded
                console.log(xhr.responseText); // handle response.

                // Loading document.
                const pdf_doc = pdfjsLib.getDocument({
                  url: "/static/uploads/tmp.pdf",
                  cMapUrl: CMAP_URL,
                  cMapPacked: CMAP_PACKED,
                });
                pdf_doc.promise.then(function (pdfDocument) {
                  // Document loaded, specifying document for the viewer and
                  // the (optional) linkService.
                  pdfViewer.setDocument(pdfDocument);
                  console.log("open pdf");
                });

                /**
                 * extract sentences from PDF
                 */
                $.ajax({
                    url: '/extract_sentences',
                    contentType: "application/json",
                }).done(function(results) {

                    // no matched sentences when new pdf is loaded
                    matchedSentences = [];

                    // reference returned sentences from parsing the PDF
                    sentences = results;

                    console.log('results');
                    console.log(results);
                    $('#table').bootstrapTable();
                    $('#table').bootstrapTable('load', []);
                    $('#table').bootstrapTable('resetView');
                });

            }
        };
        fd.append("the_file", file);
        xhr.send(fd);
    },

    /**
     * PDF is loaded handling function
     */
    pdfloaded: function () {
        console.log('pdfviewer-iframe loaded');

        setTimeout(function() {

            $('#pdfviewer-div').show();

            // reference pdf viewer
            var iframe = window.frames['pdfviewer-iframe']
            var idoc = iframe.contentDocument || iframe.contentWindow.document; // ie compatibility

            $("#pdfviewer-iframe").contents().find(".textLayer").mouseup(function() {
                console.log('*** mouseup');

                var text = idoc.getSelection().toString();

                console.log('   idoc.getSelection()', idoc.getSelection());
                console.log('   text', text);

                // referenced to the clicked word
                var clickedWord = idoc.getSelection().anchorNode.nodeValue;
                console.log('clickedWord', clickedWord);

                // highlight clicked word if present when no dragged over text
                if (text.trim() === '' && clickedWord !== '') {

                    // set the clicked word as searched text
                    $('.search-input').val(clickedWord);


                    // highlight sentences by searching clicked word in pdf viewer
                    $.highlightSentenceByClickedWordInPDFViewer(idoc, clickedWord);


                    // select sentences by clicked word
                    var matches = $.selectSentencesByClickedWord(clickedWord);
                    matchedSentences = matchedSentences.concat(matches);


                    // show selected sentences in sentences in grid
                    var table = $('#table');
                    $.showSentenceByClickedWordInTable(table, matchedSentences);
                }
            })

        }, 3000);
    },


    /**
     * Select sentences by keyword
     */
    selectSentencesByClickedWord: function(clickedWord) {
        // select sentences based on clicked word
        var selectedSentences = [];
        sentences.forEach(function(sentence) {
            if (sentence.sentence.indexOf(clickedWord) > -1) {
                sentence.clickedWord = clickedWord;
                selectedSentences.push(sentence);
            }
        })
        console.log('selectedSentences', selectedSentences);
        return selectedSentences;
    },


    /**
     * Show sentence by clicked word in table
     */
    showSentenceByClickedWordInTable: function(table, selectedSentences) {
        $('#table').bootstrapTable();
        $('#table').bootstrapTable('load', selectedSentences);
        $('#table').bootstrapTable('resetView');
    },


    /**
     * Highlight sentence by clicked word in pdf viewer
     */
    highlightSentenceByClickedWordInPDFViewer: function(idoc, clickedWord) {
    
        // search forward direction
        var forwardSegments = [];
        var sentenceWords = [];
        var hasMatchedBefore = false;
        $(idoc).find('div.textLayer>div').toArray().forEach(function(el, idx) {
            var thisWord = $(el).html();
            var hasMatchedClickedWord = thisWord === clickedWord;
            if (hasMatchedBefore || hasMatchedClickedWord) {
                console.log('thisWord', thisWord, 'idx', idx);
                sentenceWords.push(thisWord);
                $(el).css('background-color', 'red').css('color', 'white');
                hasMatchedBefore = true;
            }

            var hasEndOfSentence = thisWord.indexOf('.') > -1 || thisWord.indexOf('?') > -1 || thisWord.indexOf('!') > -1;
            if (hasEndOfSentence && hasMatchedBefore) {
                hasMatchedBefore = false;
                forwardSegments.push(sentenceWords.join(' '));
                sentenceWords = [];
            }
        })

        // now do a backward search
        var backwardSegments = [];
        var sentenceWords = [];
        var hasMatchedBefore = false;
        $(idoc).find('div.textLayer>div').toArray().reverse().forEach(function(el, idx) {
            var thisWord = $(el).html();
            var hasMatchedClickedWord = thisWord === clickedWord;
            var hasEndOfSentence = thisWord !== clickedWord && (thisWord.indexOf('.') > -1 || thisWord.indexOf('?') > -1 || thisWord.indexOf('!') > -1);
            if (!hasEndOfSentence && (hasMatchedBefore || hasMatchedClickedWord)) {
                sentenceWords.push(thisWord);
                $(el).css('background-color', 'red').css('color', 'white');
                hasMatchedBefore = true;
            }
            if (hasEndOfSentence && hasMatchedBefore) {
                backwardSegments.push(sentenceWords.reverse().join(' '));
                hasMatchedBefore = false;
                sentenceWords = [];
            }
        })
    },

})

$(document).ready(function() {

    // define file upload event handler
    $('input[type="file"]').change($.uploadFile);

    // permanently highlight sentences
    $('#search-selected-button').click(function () {
        $.ajax({
            url: '/highlight_sentences',
            method: 'POST',
            contentType: "application/json",
            data: JSON.stringify($('#table').bootstrapTable('getSelections'))
        }).done(function(results) {

            var uploadedPdfUrl = hilitepdf_url + '?run=' + parseInt(Math.random()*500000);

            $('#pdfviewer-div').empty().hide().append('<iframe id="pdfviewer-iframe" src="/static/ViewerJS/index.html?title=' + pdfViewerCustomizations.title + '#' + uploadedPdfUrl + '" width=100% height=500 allowfullscreen webkitallowfullscreen onload="$.pdfloaded()"></iframe>');
        });
    })
});


