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
let select_sentence_button = document.getElementById("select_sentence");
select_sentence_button.addEventListener("click", on_select_sentence_button_click, false);
let clear_all_highlight_button = document.getElementById("clear_highlight");
clear_all_highlight_button.addEventListener("click", on_clear_all_highlight_button_click, false);
let viewer = document.getElementById("viewer");
viewer.addEventListener("dblclick", on_dblclick);
var selected_sentnce_table = document.getElementById('selected_sentnce_table');

function on_dblclick(event) {
  //console.log("on_mouse_up in");
  console.log(event);
  //console.log(event.srcElement.textContent);

  var dblclicked_word = event.srcElement.textContent;
  var sentence = event.srcElement.textContent;
  if (sentence == "") return;

  if (event.srcElement.className != "textLayer" && event.srcElement.className != "endOfContent") {
    // change to the background color of the dblclicked element
    change_background_color(event.srcElement.style);
  } else {
    return;
  }

  var previous_element = get_previous_element(event.srcElement.previousElementSibling);
  while (previous_element != null) {
    let previous_word = previous_element.textContent;
    if (previous_word.indexOf('.') > -1 || previous_word.indexOf('?') > -1 || previous_word.indexOf('!') > -1) {
        previous_element = null;
    } else {
      if (previous_word != " " && previous_word != "　") {
        change_background_color(previous_element.style);
      }
      sentence = previous_word + sentence;
        // null is no more next element;
      previous_element = get_previous_element(previous_element);
    }
  }

  if (dblclicked_word.indexOf('.') == -1 && dblclicked_word.indexOf('?') == -1 && dblclicked_word.indexOf('!') == -1) {
    var next_element = get_next_element(event.srcElement.nextElementSibling);
    while (next_element != null) {
      let next_word = next_element.textContent;
      sentence += next_word;
      if (next_word != " " && next_word != "　") {
        change_background_color(next_element.style);
      }
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
    //console.log("found spacy sentence: " + spacy_sentence);
  }

  if (is_new_selection) {
    append_table_row(sentence);
  }
  //console.log("on_mouse_up end");
}

function is_new_selection() {
  if (style.backgroundColor == 'rgb(0, 100, 0)') {
    return false;
  } else {
    return true;
  }
}

function append_table_row(selected_sentnce) {
  var row = selected_sentnce_table.insertRow(-1);

  var checkbox_cell = row.insertCell(0);
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type','checkbox');
  checkbox.setAttribute('checked', 'true');
  checkbox_cell.appendChild(checkbox);

  var sentence_cell = row.insertCell(-1);
  sentence_cell.appendChild(document.createTextNode(selected_sentnce));
}

var is_new_selection = false;
function change_background_color(style) {
  if (style.backgroundColor == 'rgb(0, 100, 0)') {
    style.backgroundColor = '';
    is_new_selection = false;
  } else {
    style.backgroundColor = 'rgb(0, 100, 0)';
    is_new_selection = true;
  }
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

function on_select_sentence_button_click() {
  //console.log("call on_search_click");
  //console.log("search_word: " + search_word);
  let search_word = document.getElementById("search_word").value;
  // search forward direction
  var forwardSegments = [];
  var sentenceWords = [];
  var hasMatchedBefore = false;
  $(document).find('div.textLayer>span').toArray().forEach(function(el, idx) {
      var thisWord = $(el).html();
      var hasMatchedClickedWord = thisWord.indexOf(search_word) > -1;
      if (hasMatchedBefore || hasMatchedClickedWord) {
          //console.log('thisWord', thisWord, 'idx', idx);
          sentenceWords.push(thisWord);
          if (thisWord != " " && thisWord != "　") {
            $(el).css('background-color', 'green');
          }
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
  $(document).find('div.textLayer>span').toArray().reverse().forEach(function(el, idx) {
      var thisWord = $(el).html();
      var hasMatchedClickedWord = thisWord.indexOf(search_word) > -1;
      var hasEndOfSentence = thisWord.indexOf(search_word) == -1 && (thisWord.indexOf('.') > -1 || thisWord.indexOf('?') > -1 || thisWord.indexOf('!') > -1);
      if (!hasEndOfSentence && (hasMatchedBefore || hasMatchedClickedWord)) {
          sentenceWords.push(thisWord);
          if (thisWord != " " && thisWord != "　") {
            $(el).css('background-color', 'green');
          }
          hasMatchedBefore = true;
      }
      if (idx > 1) {
        if (hasEndOfSentence && hasMatchedBefore) {
            backwardSegments.push(sentenceWords.reverse().join(' '));
            hasMatchedBefore = false;
            sentenceWords = [];
            //console.log('thisWord', thisWord, 'idx', idx);
          }
      }
  })

  let selected_sentences = forwardSegments.push(backwardSegments);

  console.log(forwardSegments);
  console.log(backwardSegments);
  console.log("selected sentence:");
  console.log(selected_sentences);

}

function on_clear_all_highlight_button_click(event) {
  $(document).find('div.textLayer>span').toArray().forEach(function(el, idx) {
      $(el).css('background-color', '');
  })
}

// the remote pdf file url
var pdf_url = '../uploads/tmp.pdf';
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
                });

            }
        };
        fd.append("the_file", file);
        xhr.send(fd);
    },

})

$(document).ready(function() {
    // define file upload event handler
    $('input[type="file"]').change($.uploadFile);
});


