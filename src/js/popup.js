const {
  get,
  Event,
} = realdom;

const {
  trim,
} = bella;

const {
  getDomainFromURL,
  getPatternsByDomain,
} = util;

let $inputDomain = get('inputDomain');
let $inputPatterns = get('inputPatterns');
let $btnSubmit = get('btnSubmit');
let $frmSave = get('frmSave');

const standalize = (selectors) => {
  return selectors.split('\n').map((line) => {
    if (line.indexOf(' ') >= 0) {
      return line.split(' ').map((className) => {
        return trim(className);
      }).filter((className) => {
        return className !== '';
      }).reduce((prev, curr) => {
        return `${prev}.${curr}`;
      }, '');
    } else if (!line.startsWith('.') && !line.startsWith('#')) {
      return `#${line}`;
    }
    return line;
  });
};

const updatePopupWith = (url) => {
  let patterns = [];
  let domain = getDomainFromURL(url);
  if (domain) {
    patterns = getPatternsByDomain(domain);
  }
  $inputDomain.value = domain;
  $inputPatterns.value = patterns.join('\n');
};

const disableForm = () => {
  $btnSubmit.disabled = true;
};

const enableForm = () => {
  $btnSubmit.disabled = false;
};

Event.on($frmSave, 'submit', (e) => {
  Event.stop(e);
  disableForm();

  let key = $inputDomain.value;
  let selectors = trim($inputPatterns.value);
  let patterns = selectors.length > 0 ? standalize(selectors) : '';
  if (patterns !== '') {
    $inputPatterns.value = patterns.join('\n');
  }

  chrome.runtime.sendMessage({key, patterns}, () => {
    setTimeout(enableForm, 2000);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    let {
      url = '',
    } = tabs[0] || {};
    updatePopupWith(url);
  });
});
