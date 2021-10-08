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
clear_all_highlight_button.addEventListener("click", on_clear_all_highlight, false);

let clear_table_records = document.getElementById("clear_table_records");
clear_table_records.addEventListener("click", on_clear_table_records_click, false);

let viewer = document.getElementById("viewer");
viewer.addEventListener("dblclick", on_dblclick);

let load_pages = document.getElementById("load_pages");
load_pages.addEventListener("click", on_load_pages);

var selected_sentnce_table = document.getElementById('selected_sentnce_table');

function show_balloon(target_element){
  if (target_element.className == "balloon_hyde"){
    target_element.className = "balloon";
  }else{
    target_element.className = "balloon_hyde";
  }
}

function on_dblclick(event) {
  console.log(event);

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

function on_load_pages() {
  scroll_test_3();
}

function check_end_of_line(value) {
  if (value.indexOf('.') > -1 || value.indexOf('?') > -1 || value.indexOf('!') > -1) {
    return value;
  }
}

function get_min_index(index_1, index_2, index_3) {
  console.log("index_1: " + index_1, "index_2: " + index_2, "index_3: " + index_3)
  let list = [];
  if (index_1 != -1) list.push(index_1);
  if (index_2 != -1) list.push(index_2);
  if (index_3 != -1) list.push(index_3);
  const aryMin = function (a, b) {return Math.min(a, b);}
  let min_index = list.reduce(aryMin);
  console.log("min_index: " + min_index)
  return min_index;
}

function get_max_index(index_1, index_2, index_3) {
  console.log("index_1: " + index_1, "index_2: " + index_2, "index_3: " + index_3)
  let list = [];
  if (index_1 != -1) list.push(index_1);
  if (index_2 != -1) list.push(index_2);
  if (index_3 != -1) list.push(index_3);
  const aryMax = function (a, b) {return Math.max(a, b);}
  let max_index = list.reduce(aryMax);
  console.log("max_index: " + max_index)
  return max_index;
}

function on_select_sentence_button_click() {
  // clear all highlight
  //on_clear_all_highlight();

  let search_word = document.getElementById("search_word").value;
  console.log("search_word: " + search_word);
  if (search_word == "" || check_end_of_line(search_word)) return;

  var sentence;
  var span_elements = document.querySelectorAll('div.textLayer > span');

  span_elements.forEach(function (current_element) {
    if (current_element.textContent.indexOf(search_word) > -1) {
      console.log("current_element.textContent: " + current_element.textContent);
      // check previous element
      var previous_element = current_element.previousElementSibling;
      //console.log("previous_element: " + previous_element);
      if (previous_element != null) {
        while (previous_element != null) {
          if (previous_element.tagName == "SPAN") {
            if (exist_child_span(previous_element)) {
              break;
            }
            let previous_word = previous_element.textContent;
            let index_1 = previous_word.indexOf('.');
            let index_2 = previous_word.indexOf('?');
            let index_3 = previous_word.indexOf('!');
            if (index_1 > -1 || index_2 > -1 || index_3 > -1) {
                var index = get_max_index(index_1, index_2, index_3);
                console.log("index=" + index);
                console.log("previous_word.length=" + previous_word.length);
                if (index == previous_word.length - 1) {
                  break;
                }
                //console.log("previous_word.length: " + previous_word.length);
                let highlight_word = previous_word.substring(index + 1, previous_word.length);
                let other_word = previous_word.substring(0, index + 1);
                console.log("prev highlight_word: " + highlight_word);
                console.log("prev other_word: " + other_word);
                // remove text content of parent element
                previous_element.innerText = other_word;
                // add child element of span
                previous_element.innerHTML = create_highlight_span(highlight_word, other_word, false);
                break;
            } else {
              previous_element.style.backgroundColor = "red";
            }
          }
          previous_element = previous_element.previousElementSibling;
        }
      }
      // check current element
      let end_of_line = false;
      let current_word = current_element.textContent;
      let index_1 = current_word.indexOf('.');
      let index_2 = current_word.indexOf('?');
      let index_3 = current_word.indexOf('!');
      if (index_1 > -1 || index_2 > -1 || index_3 > -1) {
          console.log("current_element" + current_element);
          var index = get_max_index(index_1, index_2, index_3);
          //console.log("current_word.length: " + current_word.length);
          let before_word = current_word.substring(0, index + 1);
          let after_word = current_word.substring(index + 1, current_word.length);
          console.log("current before_word: [" + before_word + "]");
          console.log("current after_word: [" + after_word + "]");
          // remove text content of parent element
          if (before_word == "" || after_word == "") {
            current_element.style.backgroundColor = "green";
          } else {
            if (after_word.indexOf(search_word) > -1) {
              // add child element of span
              console.log("after_word include search_word");
              current_element.innerHTML = create_highlight_span(before_word, after_word, false);
            } else {
              // add child element of span
              console.log("before_word include search_word");
              current_element.innerHTML = create_highlight_span(before_word, after_word, true);
            }
          }
          end_of_line = true;
      } else {
        current_element.style.backgroundColor = "green";
      }
      // check next element
      var next_element = current_element.nextElementSibling;
      if (next_element != null && end_of_line == false) {
        while (next_element != null) {
          //console.log("next_element.tagName: " + next_element.tagName);
          if (next_element.tagName == "SPAN") {
            let next_word = next_element.textContent;
            let index_1 = next_word.indexOf('.');
            let index_2 = next_word.indexOf('?');
            let index_3 = next_word.indexOf('!');
            if (index_1 > -1 || index_2 > -1 || index_3 > -1) {
              var index = get_min_index(index_1, index_2, index_3);
              // modify element of <span>
              //console.log("next_word.length: " + next_word.length);
              let highlight_word = next_word.substring(0, index + 1);
              let other_word = next_word.substring(index + 1, next_word.length);
              console.log("next highlight_word: [" + highlight_word + "]");
              console.log("next other_word: [" + other_word + "]");
              // add child element of span
              next_element.innerHTML = create_highlight_span(highlight_word, other_word, true);
              break;
            } else {
              next_element.style.backgroundColor = "blue";
            }
          }
          next_element = next_element.nextElementSibling;
        }
      }
    }
  });
}

function exist_child_span(element) {
  return element.childElementCount != 0;
}

function create_highlight_span(highlight_word, other_word, is_highlight_top) {
  let start_span = "<span class='highlight appended'>";
  let end_span = "</span>"
  if (is_highlight_top) {
    return start_span + highlight_word + end_span + other_word;
  } else {
    return other_word + start_span + highlight_word + end_span;
  }
}

function on_clear_all_highlight() {
  $(document).find('div.textLayer>span').toArray().forEach(function(el, idx) {
      $(el).css('background-color', '');
  })
  $(document).find('div.textLayer>span>span').toArray().forEach(function(el, idx) {
    $(el).remove();
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


