// // Respond to requests to close the dialog box
// let dialog;
// const body = document.querySelector("body");

// // Close the dialog when clicking anywhere or pressing Escape
// window.addEventListener("click", () => {
//   if (dialog) {
//     dialog.remove();
//   }
// });

// window.addEventListener("keydown", (e) => {
//   if (e.key === "Escape" && dialog) {
//     dialog.remove();
//   }
// });

// /*
//  * Display dialog box with translation
//  */
// function showDialog(translation) {
//   // Get selection to know where to position the dialog
//   const selection = window.getSelection();
//   if (!selection) {
//     console.log("Nothing was selected");
//     return;
//   }

//   // Create the dialog HTML
//   const dialogHtml = `
//     <p>${translation}</p>
//     <button id="copy-button">Copy</button>
//     <button id="close-button">Close</button>
//   `;

//   // If a dialog already exists, remove it
//   dialog = document.querySelector("#my-dialog");
//   if (dialog) {
//     dialog.remove();
//   }

//   // Create a new dialog
//   dialog = document.createElement("dialog");
//   dialog.innerHTML = dialogHtml;
//   dialog.id = "my-dialog";
//   dialog.open = true;
//   dialog.style = `
//     font-size: 16px; 
//     border: 1px solid #cccccc; 
//     z-index: 999; 
//     background-color: white;
//     padding: 10px;
//   `;

//   // Position the dialog near the selected text
//   const range = selection.getRangeAt(0);
//   const parent = range.commonAncestorContainer.parentNode;
//   parent.appendChild(dialog);

//   // Copy translation to clipboard when clicking "Copy"
//   document.getElementById("copy-button").addEventListener("click", () => {
//     navigator.clipboard.writeText(translation).then(() => {
//       console.log("Translation copied to clipboard.");
//     }).catch(err => {
//       console.error("Failed to copy translation to clipboard:", err);
//     });
//   });

//   // Close the dialog when clicking "Close"
//   document.getElementById("close-button").addEventListener("click", () => {
//     dialog.remove();
//   });

//   // Close the dialog when clicking anywhere outside of it
//   dialog.addEventListener("click", (event) => {
//     if (event.target === dialog) {
//       dialog.remove();
//     }
//   });
// }

// // Listen for translation messages from service-worker.js
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.translation) {
//     console.log("Received translation:", request.translation);
//     // Show the translation in a dialog
//     showDialog(request.translation);
//   }
// });




window.addEventListener("click", async () => {
  const selection = window.getSelection().toString().trim(); // Get the selected text
  if (selection) {
      const { from, to } = await chrome.storage.local.get(["from", "to"]);
      const translation = await callApilayerTranslate(selection, to);
      chrome.tabs.sendMessage(tabs.id, { translation });
  } else {
      console.log("No text selected");
  }
});
