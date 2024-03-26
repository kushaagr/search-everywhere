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

