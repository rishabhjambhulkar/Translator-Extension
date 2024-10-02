Here’s a complete documentation of your Chrome extension project that translates selected text using the Apilayer translation API. This Markdown documentation explains the overall architecture, key components, and how the extension works.

---

# Chrome Extension for Text Translation

This Chrome extension allows users to translate selected text on a webpage using the Apilayer translation API. The extension provides a context menu item to translate any selected text and automatically copies the translation to the clipboard. 

## Features
- Fetches supported languages from the Apilayer API and allows users to select the source and target languages.
- Translates selected text on a webpage.
- Copies the translated text to the clipboard.
- Displays translation in the console for debugging purposes.
- Supports user-defined source (`from`) and target (`to`) languages.

## Project Structure

```
.
├── manifest.json
├── background.js (service worker)
├── contentScript.js
├── popup.html
├── popup.js
└── README.md
```

### `manifest.json`

The `manifest.json` file defines the extension’s permissions, background script, and content script.

```json
{
  "manifest_version": 3,
  "name": "Text Translator",
  "description": "Translates selected text using Apilayer API",
  "version": "1.0",
  "permissions": ["storage", "contextMenus", "activeTab", "scripting", "clipboardWrite"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"]
    }
  ],
  "host_permissions": [
    "https://api.apilayer.com/*"
  ]
}
```

### `background.js` (Service Worker)

The `background.js` script is responsible for handling the context menu and fetching supported languages from the Apilayer API during extension installation.

```javascript
// Create context menu option and fetch supported languages on extension installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translate-menu",
        title: "Translate '%s'",
        contexts: ["selection"],
    });

    // Fetch languages from apilayer
    fetchSupportedLanguages();
});

// Fetch supported languages from Apilayer API and store in local storage
async function fetchSupportedLanguages() {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "YOUR_API_KEY");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    try {
        const response = await fetch("https://api.apilayer.com/language_translation/languages", requestOptions);
        const result = await response.json();
        chrome.storage.local.set({ languages: result.languages });
        console.log("Supported languages:", result.languages);
    } catch (error) {
        console.error("Error fetching languages:", error);
    }
}

// Handle context menu click event and translate selected text
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.selectionText) {
        const { from, to } = await chrome.storage.local.get(["from", "to"]);
        const translation = await callApilayerTranslate(info.selectionText, to);

        // Send translation to content script
        chrome.tabs.sendMessage(tab.id, { translation }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message: ", chrome.runtime.lastError.message);
            } else {
                console.log("Translation sent successfully:", response);
            }
        });
    }
});

// Call Apilayer API to translate text
async function callApilayerTranslate(text, target_lang) {
    const API_URL = `https://api.apilayer.com/language_translation/translate?target=${target_lang}`;
    const myHeaders = new Headers();
    myHeaders.append("apikey", "YOUR_API_KEY");

    const raw = JSON.stringify({ text });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const { text: translatedText } = result.translations[0];
        console.log("Translation:", translatedText);
        return translatedText;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}
```

### `contentScript.js`

The content script handles interactions on the webpage, such as copying the translation to the clipboard and displaying the translated text.

```javascript
console.log("Content script loaded on this page");

// Listen for messages from the service worker and copy the translation to the clipboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.translation) {
        navigator.clipboard.writeText(request.translation)
            .then(() => {
                console.log("Translation copied to clipboard:", request.translation);
                sendResponse({ status: "success" });
            })
            .catch(err => {
                console.error("Could not copy text: ", err);
                sendResponse({ status: "error", message: err });
            });
        return true; // Keep the message channel open for sendResponse
    }
});
```

### `popup.html`

The popup provides a simple UI to allow users to select their preferred source (`from`) and target (`to`) languages.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translator Settings</title>
</head>
<body>
    <h1>Translation Settings</h1>
    <label for="from">From:</label>
    <select id="from"></select>

    <label for="to">To:</label>
    <select id="to"></select>

    <button id="save-button">Save</button>

    <script src="popup.js"></script>
</body>
</html>
```

### `popup.js`

This script handles fetching the supported languages and saving the user-selected languages (`from` and `to`) in local storage.

```javascript
window.addEventListener("DOMContentLoaded", async () => {
    const fromDiv = document.getElementById("from");
    const toDiv = document.getElementById("to");

    // Fetch languages from local storage
    const { languages } = await chrome.storage.local.get("languages");

    if (Array.isArray(languages)) {
        populateLanguageDropdowns(languages);
    }

    // Fetch previously selected languages
    const { from, to } = await chrome.storage.local.get(["from", "to"]);
    fromDiv.value = from || "";
    toDiv.value = to || "";

    document.getElementById("save-button").addEventListener("click", () => {
        const fromLang = fromDiv.value;
        const toLang = toDiv.value;
        chrome.storage.local.set({ from: fromLang, to: toLang });
    });
});

// Populate the language dropdowns
function populateLanguageDropdowns(languages) {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    languages.forEach(language => {
        const optionFrom = document.createElement("option");
        optionFrom.value = language.language;
        optionFrom.textContent = language.language_name;
        fromSelect.appendChild(optionFrom);

        const optionTo = document.createElement("option");
        optionTo.value = language.language;
        optionTo.textContent = language.language_name;
        toSelect.appendChild(optionTo);
    });
}
```

## How the Extension Works

1. **Installation**: When the extension is installed, the service worker (`background.js`) fetches the list of supported languages from the Apilayer API and stores them in Chrome’s local storage.

2. **Context Menu**: The extension creates a context menu item labeled “Translate” that appears when the user selects text on a webpage.

3. **Translation Process**:
   - When the user selects text and clicks the context menu item, the selected text is sent to the Apilayer API for translation.
   - The target language is retrieved from local storage (set in the popup UI).
   - The translated text is copied to the clipboard, and a success message is logged.

4. **Popup UI**: Users can select the source (`from`) and target (`to`) languages via the popup UI. The selected languages are saved in local storage and used during the translation process.

## Setup and Installation

1. Clone the repository or download the source code.
2. Replace `YOUR_API_KEY` with your actual Apilayer API key in `background.js`.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer Mode" and click "Load Unpacked".
5. Select the project folder.
6. The extension will now be loaded and can be used.

## Permissions

- **Storage**: To save the user's preferred source and target languages.
- **Context Menus**: To add the "Translate" option when the user selects text.
- **Scripting**: To run the content script and interact with the webpage.
- **Clipboard Write**: To copy the translated text to the clipboard.
- **Host Permissions**: To access the Apilayer API.

---

This documentation should help you understand the structure and functionality of the Chrome extension. If you need further customization or have additional questions, feel free to ask!
