import { getResponse } from './sample-response-data.js';

const metadetails = [
  {
    "of": "duckduckgo", 
    "container": "duckduckgo-results-list", 
    "template": "duckduckgo-content-template",
    "properties": {
      ".abstract": "abstract",
      ".title": "title",
      ".url": "url",
    }, 
    "attributes": {
      "a": [ {"href": "url"} ]
    }
  },
  {
    "of": "youtube", 
    "container": "youtube-results-list", 
    "template": "youtube-content-template",
    "properties": {
      ".description": "snippet.description",
      ".title": "snippet.title",
    }, 
    "attributes": {
      "a": [ {"href": "id.videoId"} ],
      ".wide-broad-thumbnail": [{"src": "snippet.thumbnails.medium.url"}]
    }
  },
  {
    "of": "github", 
    "container": "github-results-list", 
    "template": "github-content-template",
    "properties": {
      ".description": "description",
      ".full-name": "full_name",
      ".language": "language",
    }, 
    "attributes": {
      "a": [ {"href": "html_url"} ]
    }
  },
  {
    "of": "reddit", 
    "container": "reddit-results-list", 
    "template": "reddit-content-template",
    "properties": {
      ".title": "data.title",
      ".subreddit": "data.subreddit",
    }, 
    "attributes": {
      "a": [ {"href": "data.permalink"} ],
      ".short-square-thumbnail": [ {"src": "data.thumbnail"} ]
    }
  },
  // , { ... }
]



// console.log(await response());
const response = await getResponse();
console.log("Fetched response", response);


const mainBox = document.getElementById('main-container');
const buttons = document.getElementsByClassName('link-button');
// console.log(buttons);


for (const [i, button] of Array.from(buttons).entries()) {
  button.addEventListener('click', function() {
    mainBox.scroll({
      left: i*38*8,
      behavior: 'smooth',
    });
  });
}



Element.prototype.appendInAttribute = function (attribute, value) {
  const currentValue = this.getAttribute(attribute) || '';
  this.setAttribute(attribute, `${currentValue}${value}`);
}


function splitAndGrab(multidimObject, dotNotationStr, delim='.') {
  return dotNotationStr.split(delim).reduce(
    (denestingAccumulator, currentKey) => denestingAccumulator[currentKey],
    multidimObject
  );
}


const cloneTemplate = (templateNode) => templateNode.content.cloneNode(true);


const mapContent = (cloneTemplate, dataObject, selectorToDataKeyMap) => {
  for (const [selector, dataKey] of Object.entries(selectorToDataKeyMap)) {
    const el = cloneTemplate.querySelector(selector);

    el.textContent = splitAndGrab(dataObject, dataKey);
  }
  return cloneTemplate;
}


const mapAttributes = (cloneTemplate, dataObject, selectorToAttributeMap) => {
  for (const [selector, attrObjList] of Object.entries(selectorToAttributeMap)) {
    const targetElement = cloneTemplate.querySelector(selector);

    for (const attributeObj of attrObjList) {
      for (const [attr, value] of Object.entries(attributeObj)) {
        
        targetElement.appendInAttribute(
          attr, splitAndGrab(dataObject, value)
        )
      };
    }
  }
  return cloneTemplate;
}


// Test to see if the browser supports the HTML template element by checking
// for the presence of the template element's content attribute.
if ('content' in document.createElement('template')) {

  
  for (const [elem, data] of Object.entries(response)) {
    const metaData = metadetails.find((obj) => obj['of'] === elem);
    if (metaData == null)
      continue;
    const container = document.getElementById(metaData['container']);
    const template = document.getElementById(metaData['template']);
    // console.log(container, "The container");

    data.forEach((infoBlob, index) => {
      let draft = cloneTemplate(template);
      draft = mapContent(draft, infoBlob, metaData['properties']);
      draft = mapAttributes(draft, infoBlob, metaData['attributes']);
      container.appendChild(draft);
    })
  }

  
} else {
  alert("Results will not be displayed because your browser does not support <template> tag!");
}
