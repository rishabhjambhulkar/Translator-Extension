


window.addEventListener("DOMContentLoaded", async () => {
    const fromDiv = document.getElementById("from");
    const toDiv = document.getElementById("to");
   
    // Fetch languages from local storage
    const { languages } = await chrome.storage.local.get("languages");

    // Log the languages to check if they are fetched properly
    console.log("Languages from local storage:", languages);

    if (Array.isArray(languages)) {
        populateLanguageDropdowns(languages);
    } else {
        console.error("Languages is not an array or is undefined");
    }

    // Fetch previously selected languages
    const { from, to } = await chrome.storage.local.get(["from", "to"]);
    fromDiv.value = from || (languages && languages[0] && languages[0].language) || ""; // Default to first language if available
    toDiv.value = to || (languages && languages[1] && languages[1].language) || ""; // Default to second language if available

    // Change event listeners to save selected languages and log the selected language
    fromDiv.addEventListener("change", () => {
        const selectedFromOption = fromDiv.options[fromDiv.selectedIndex];
        console.log("Selected From Language:", selectedFromOption.value, selectedFromOption.textContent); // Log value and name
        chrome.storage.local.set({ from: selectedFromOption.value });
    });

    toDiv.addEventListener("change", () => {
        const selectedToOption = toDiv.options[toDiv.selectedIndex];
        console.log("Selected To Language:", selectedToOption.value, selectedToOption.textContent); // Log value and name
        chrome.storage.local.set({ to: selectedToOption.value });
    });


});

// Populate the language dropdowns based on the structure of the language data
function populateLanguageDropdowns(languages) {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    // Clear existing options
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    // Populate dropdowns
    languages.forEach(language => {
        const optionFrom = document.createElement("option");
        optionFrom.value = language.language; // Use the language code as the value
        optionFrom.textContent = `${language.language_name} (${language.native_language_name})`; // Display both the language name and native name
        fromSelect.appendChild(optionFrom);

        const optionTo = document.createElement("option");
        optionTo.value = language.language;
        optionTo.textContent = `${language.language_name} (${language.native_language_name})`;
        toSelect.appendChild(optionTo);
    });
}
