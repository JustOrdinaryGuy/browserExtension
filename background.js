let SEPERATOR = ';';

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "startRecording") {
        console.log("Recording started.");
        //Store value use to activate isRecoding template
        chrome.storage.local.set({ 'isRecoding': 'true' }).then(() => {
            console.log("Value is set to true ");
        });
        // Inject the content script into the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id},
                files: ["content.js"]
            });
        });
    } 
    if (message.type === "stopRecording") {
        //Signal to template to not show onTrack status when reopen
        chrome.storage.local.set({ 'isRecoding': 'false' }).then(() => {
            console.log("Value is set to false");
        });
        console.log("Recording stopped.");
        chrome.runtime.sendMessage({ type: "stopRecordingNotification" });

        convertContentToDownloadFile();

        //Reset content script by reload page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                chrome.tabs.reload(activeTab.id);
            }
        });
    }
    if (message.type === "recordClick") {
        var url = '';
        if (message.data.link) {
            url = message.data.link;
            appendValueToLocalStorage('click_link', url);
        }
    }
});

function downloadURL(URL) {
    var url = URL || '';

    console.log('Url', url);

    var fileOptions = {
        url: url,
        filename: "Bluesky_like.txt",
        conflictAction: "uniquify",
        saveAs: true
    }

    chrome.downloads.download(fileOptions, (downloadId) => {
    if (chrome.runtime.lastError) {
        console.error(`Error: ${chrome.runtime.lastError.message}`);
    } else {
        console.log(`File downloaded with ID: ${downloadId}`);
    }
    });
}

// Wrapping chrome.storage.local.set in a Promise
function setItemAsync(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}
  
// Wrapping chrome.storage.local.get in a Promise
function getItemAsync(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
        } else {
            resolve(result[key]);
        }
        });
    });
}
  
//Store clicked url to local storage
async function appendValueToLocalStorage(localId, value) {
    try {
        var localValue = await getItemAsync(localId); // Getting the value
        if (!localValue) {
            localValue = value;
        } else {
            localValue = localValue + SEPERATOR + value;
        }
        await setItemAsync(localId, localValue);
        console.log("Write value:", localValue);
    } catch (error) {
        console.error("Error:", error);
    }
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Resolve with the Data URL
        reader.onerror = () => reject(new Error("Failed to read Blob"));
        reader.readAsDataURL(blob); // Start the asynchronous operation
    });
}
  
  // Usage example
async function convertContentToDownloadFile() {
    try {
        //Get stored link
        var localValue = await getItemAsync('click_link');
        
        console.log('Lcvalue', localValue);
        if (localValue) {
            localValue = localValue.toString();
            localValue = localValue.split(SEPERATOR);
            console.log('Local val', localValue);
            const blob = new Blob(localValue, { type: "text/plain" });
            var url = await blobToDataURL(blob);
            console.log("Url", url);
            downloadURL(url);
        }
        await setItemAsync('click_link', '');
    } catch (error) {
        console.error(error.message);
    }
}

