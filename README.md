What is a Content Script?
A content script is a JavaScript file that runs in the context of web pages loaded in the browser. It allows you to interact with the DOM of the page and manipulate its contents, as well as respond to user actions. Content scripts can be used to:

Modify the appearance of a web page.
Read data from the page.
Listen for events occurring on the page.
Communicate with other parts of a Chrome extension, such as the background script and popup.
Key Characteristics of Content Scripts:

Isolated Environment: Content scripts run in an isolated environment. This means they have their own scope and cannot directly access variables or functions defined by the page (for example, scripts running on a webpage). However, they can access the DOM of the webpage.

Permissions: Content scripts can only access the pages that are permitted by the manifest file of the Chrome extension. You can specify which pages your content scripts can run on using the matches property in the manifest.

Communication with Other Parts of the Extension: Content scripts can communicate with the background script or popup using the chrome.runtime.sendMessage and chrome.runtime.onMessage APIs.
