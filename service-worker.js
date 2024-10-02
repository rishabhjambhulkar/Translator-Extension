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

async function fetchSupportedLanguages() {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "eZaADgi51DP7ZjETJs5k4VH2NbhstLRD");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };

    try {
        const response = await fetch("https://api.apilayer.com/language_translation/languages", requestOptions);
        const result = await response.json();

        // Assuming result.languages is an array of language objects
        chrome.storage.local.set({ languages: result.languages });
        
        // Log the result to see the structure
        console.log("Supported languages:", result.languages);
    } catch (error) {
        console.error("Error fetching languages:", error);
    }
}


async function callApilayerTranslate(text, target_lang) {
    const API_URL = `https://api.apilayer.com/language_translation/translate?target=${target_lang}`;

    const myHeaders = new Headers();
    myHeaders.append("apikey", "eZaADgi51DP7ZjETJs5k4VH2NbhstLRD");

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

        // Log the API response for debugging
        console.log("API Response:", result);

        // Access the translation directly
        const translation = result.translations[0].translation;

        // Log details
        console.log("Translation:", translation);
        console.log("Word Count:", result.word_count);
        console.log("Character Count:", result.character_count);
        console.log("Detected Language:", result.detected_language);
        console.log("Detected Language Confidence:", result.detected_language_confidence);

        return translation; // Return the translation text
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null; // Return null in case of an error
    }
}


chrome.contextMenus.onClicked.addListener(async (info, tabs) => {
    const { from, to } = await chrome.storage.local.get(["from", "to"]);
    if (info.selectionText) {
        const translation = await callApilayerTranslate(info.selectionText, to);
        // Send the translation to the content script
        chrome.tabs.sendMessage(tabs.id, { translation }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message: ", chrome.runtime.lastError.message);
            }
        });
    }
});
