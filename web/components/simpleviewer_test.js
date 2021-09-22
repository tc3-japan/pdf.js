//"use strict";

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.js";

// Some PDFs need external cmaps.
//
const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

const DEFAULT_URL = "../../web/compressed.tracemonkey-pldi-09.pdf";
// To test the AcroForm and/or scripting functionality, try e.g. this file:
// var DEFAULT_URL = "../../test/pdfs/160F-2019.pdf";

SEARCH_FOR = "Mozilla"; // try 'Mozilla';
const SANDBOX_BUNDLE_SRC = "../../node_modules/pdfjs-dist/build/pdf.sandbox.js";

const container = document.getElementById("viewerContainer");
console.log(container);

btn = document.getElementById("search");
btn.addEventListener("click", on_search_click, false);

const eventBus = new pdfjsViewer.EventBus();

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
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

const pdfViewer = new pdfjsViewer.PDFViewer({
  container,
  eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
  enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
  scale: 0.5,
});
pdfLinkService.setViewer(pdfViewer);
pdfScriptingManager.setViewer(pdfViewer);

eventBus.on("pagesinit", function () {
  // We can use pdfViewer now, e.g. let's change default scale.
  //pdfViewer.currentScaleValue = "page-width";
  pdfViewer.currentScaleValue = 1;

  // We can try searching for things.
  if (SEARCH_FOR) {
    //pdfFindController.executeCommand("find", { query: SEARCH_FOR });
  }
});

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
});
loadingTask.promise.then(function (pdfDocument) {
  // Document loaded, specifying document for the viewer and
  // the (optional) linkService.
  pdfViewer.setDocument(pdfDocument);

  pdfLinkService.setDocument(pdfDocument, null);
});

function on_search_click(){
  console.log("call on_search_click");
  let word = document.getElementById("search_word").value;
  console.log(search_word);

  //let click_word = getSelection().anchorNode.nodeValue;
  //console.log(click_word);

  var forEach = Array.prototype.forEach;

  var span = document.querySelectorAll('div.textLayer > span');
  forEach.call(span, function (elem) {
    text = elem.textContent;
    if (text.includes(word) && word != "") {
      console.log(text);
      elem.style.backgroundColor = '#f00';
    } else {
      elem.style.backgroundColor = '';
    }
  });

  /*

  loadingTask.promise.then(function (pdfDocument) {
    // find
    // findhighlightallchange
    // findagain
    pdfFindController.executeCommand("find", {
      query: search_word,
      phraseSearch: true,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: false,
      });
  });

  loadingTask.promise.then(function (pdfDocument) {
    for (var i = 1; i <= pdfDocument.numPages; i++) {
      pdfDocument.getPage(i).then(function(page) {
        console.log(page.getTextContent());
      })
    }
  });
  */
}