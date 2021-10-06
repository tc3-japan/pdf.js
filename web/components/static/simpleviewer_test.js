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
var pdfDocument;
// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});
// (Optionally) enable find controller.
const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: pdfLinkService,
});
// (Optionally) enable scripting support.
const SANDBOX_BUNDLE_SRC = "/static/pdfjs-dist/build/pdf.sandbox.js";
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});
const pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  //scale: 0.5,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
  enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
  textLayerMode: 1,
});
pdfLinkService.setViewer(pdfViewer);
pdfScriptingManager.setViewer(pdfViewer);

eventBus.on("pagesinit", function () {
  pdfViewer.currentScaleValue = 1;
  pdfViewer.forceRendering();
});

// Add event listener
let select_sentence_button = document.getElementById("select_sentence");
select_sentence_button.addEventListener("click", on_select_sentence_button_click, false);

let clear_all_highlight_button = document.getElementById("clear_highlight");
clear_all_highlight_button.addEventListener("click", on_clear_all_highlight_button_click, false);

let clear_table_records = document.getElementById("clear_table_records");
clear_table_records.addEventListener("click", on_clear_table_records_click, false);

let viewer = document.getElementById("viewer");
viewer.addEventListener("dblclick", on_dblclick);

var selected_sentnce_table = document.getElementById('selected_sentnce_table');

function show_balloon(target_element){
  if (target_element.className == "balloon_hyde"){
    target_element.className = "balloon";
  }else{
    target_element.className = "balloon_hyde";
  }
}

function on_dblclick(event) {
  //console.log("on_mouse_up in");
  console.log(event);
  //console.log(event.srcElement.textContent);

  var dblclicked_word = event.srcElement.textContent;
  var sentence = event.srcElement.textContent;
  // when white space dblclicked
  if (sentence == "" || sentence == " " || sentence == "　") return;

  if (event.srcElement.className != "textLayer" && event.srcElement.className != "endOfContent") {
    // change to the background color of the dblclicked element
    change_background_color(event.srcElement.style);
  } else {
    return;
  }

  // balloon test
  //show_balloon(event.srcElement);

  // index and top test
  var index;
  var top;
  $(document).find('div.textLayer>span').toArray().forEach(function(el, idx) {
    if (event.srcElement.innerHTML == $(el).html()) {
      console.log("match element. index=" + idx);
      index = idx;
      top = event.srcElement.style.top;
    }
  })

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
  if (is_new_selection) {
    append_table_row(sentence, index, top);
  }
  /*
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
  */
}

function append_table_row(selected_sentnce, index, top) {
  var row = selected_sentnce_table.insertRow(-1);

  var checkbox_cell = row.insertCell(-1);
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type','checkbox');
  checkbox.setAttribute('checked', 'true');
  checkbox_cell.appendChild(checkbox);

  var sentence_cell = row.insertCell(-1);
  sentence_cell.appendChild(document.createTextNode(selected_sentnce));

  var index_cell = row.insertCell(-1);
  index_cell.appendChild(document.createTextNode(index));

  var top_cell = row.insertCell(-1);
  top_cell.appendChild(document.createTextNode(top));
}

var is_new_selection = false;
function change_background_color(style) {
  if (style.backgroundColor == 'rgb(0, 0, 100)') {
    style.backgroundColor = '';
    is_new_selection = false;
  } else {
    style.backgroundColor = 'rgb(0, 0, 100)';
    //style.opacity = 1.5;
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

function on_clear_table_records_click() {
  selected_sentnce_table.innerHTML = '';
}

function renderPDF(url, canvasContainer, options) {

  var options = options || { scale: 1 };
      
  function renderPage(page) {
      var viewport = page.getViewport(options.scale);
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvasContainer.appendChild(canvas);
      
      page.render(renderContext);
  }
  
  function renderPages(pdfDoc) {
      for(var num = 1; num <= pdfDoc.numPages; num++)
          pdfDoc.getPage(num).then(renderPage);
  }

  url = "/static/uploads/tmp.pdf",
  pdfjsLib.disableWorker = true;
  //pdfjsLib.getDocument(url).then(renderPages);
  renderPages(pdfDocument);
}

function renderPage(num){
  pdfDocument.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: 1});
    var renderContext = {
      canvasContext: container,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(
      function () {
        console.log('Page rendered');
      }
    );
  });
}

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scroll_test_1() {
  container.scrollTo(0, 1000);
  await sleep(1000);
  container.scrollTo(0, 3000);
  await sleep(1000);
  container.scrollTo(0, 5000);
  await sleep(1000);
  container.scrollTo(0, 7000);
  await sleep(1000);
  container.scrollTo(0, 9000);
  await sleep(1000);
  container.scrollTo(0, 11000);
  await sleep(1000);
}

async function scroll_test_2() {
  for (i = 1; i > 11; i++) {
    container.scrollTo(0, i * 1000);
    await sleep(1000);
  }
}

async function scroll_test_3() {
  for (i = 1; i <= pdfViewer.pagesCount; i++) {
    pdfViewer.currentPageNumber = i;
    await sleep(10);
  }
  for (i = pdfViewer.pagesCount; i >= 1; i--) {
    pdfViewer.currentPageNumber = i;
    await sleep(10);
  }
}

function show_viewer() {
  let viewer = document.getElementById("viewerContainer");
  viewer.style.display = "block";
}

function hide_layer() {
  let viewer = document.getElementById("layer");
  viewer.style.display = "none";
}

async function on_select_sentence_button_click() {
  //console.log("call on_search_click");
  //console.log("search_word: " + search_word);
  let search_word = document.getElementById("search_word").value;

  // scroll test
  //await scroll_test_1();
  //await scroll_test_2();
  await scroll_test_3();

  hide_layer();

/*
  for (i = 1; i < pdfViewer.pagesCount; i++) {
    renderPage(i);
  }
*/


  /*
  console.log("page count: ", pdfViewer.pagesCount);
  var options = options || { scale: 1 };
  renderPDF("", container, options);
  */
 /*
  for (i = 1; i < pdfViewer.pagesCount; i++) {
    pdfDocument.getPage(i).then(pdfPage => {
      pdfPage.getTextContent().then(text => {
        console.log("page num: " + i + " text:" + text);
      });
      pdfPage.draw();
      //var pdfPage = pdfDocument.getPage(i);
      //pdfLinkService.cachePageRef(i, pdfPage.ref);
      //pdfPage.render();
    });
    //pdfViewer.currentPageNumber = i;
  }
  */
  /*
  pdfFindController.executeCommand("findhighlightallchange", 
  { query: "to",
    phraseSearch: true,
    caseSensitive: true,
    entireWord: true,
    highlightAll: true,
    findPrevious: true
  });
  */

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
          //$(el).css('opacity', '0.2');
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
          //$(el).css('opacity', '0.2');
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
                  pdfViewer.setDocument(pdfDocument);
                  pdfLinkService.setDocument(pdfDocument, null);
                  this.pdfDocument = pdfDocument;
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


