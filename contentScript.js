// Function to create and show the popup with the translated text
function showPopup(translation) {
    console.log("Showing translation popup");

    // Remove any existing popup
    const existingPopup = document.getElementById('translation-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create a new popup element
    const popup = document.createElement('div');
    popup.id = 'translation-popup';
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.backgroundColor = '#333';
    popup.style.color = '#fff';
    popup.style.padding = '10px';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
    popup.style.zIndex = '10000';
    popup.style.fontFamily = 'Arial, sans-serif';
    popup.innerHTML = `
        <strong>Translation:</strong> ${translation}
        <br><br>
        <button id="popup-close" style="background-color: #ff5c5c; color: white; border: none; padding: 5px; cursor: pointer; border-radius: 3px;">Close</button>
    `;

    document.body.appendChild(popup);

    // Close the popup when the close button is clicked
    document.getElementById('popup-close').addEventListener('click', () => {
        popup.remove();
    });

    // Automatically remove the popup after 5 seconds
    // setTimeout(() => {
    //     popup.remove();
    // }, 5000);
}

// Handle messages from the service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.translation) {
        console.log("Received translation:", request.translation);

        // Show the translation in a popup
        showPopup(request.translation);

        // Copy the translation to the clipboard
        navigator.clipboard.writeText(request.translation)
            .then(() => {
                console.log("Translation copied to clipboard:", request.translation);
                sendResponse({ status: "success" });
            })
            .catch(err => {
                console.error("Could not copy text: ", err);
                sendResponse({ status: "error", message: err });
            });

        // Keep the message channel open for sendResponse
        return true;
    }
});
