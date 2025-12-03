const clearButton = document.getElementById('clear-tracking');
const startButton = document.getElementById('start-tracking');
const log = document.querySelector('.track-log');

class TrackingManager {
    constructor(log) {
      this.logElement = log;
      if (TrackingManager.instance) {
        return TrackingManager.instance;
      }

      TrackingManager.instance = this;
  
      this.logMessage('Manager: initializing demo');
      this.listener = null;
    }
  
    logMessage(message) {
      const date = new Date();
      const pad = (val, len = 2) => val.toString().padStart(len, '0');
      const h = pad(date.getHours());
      const m = pad(date.getMinutes());
      const s = pad(date.getSeconds());
      const ms = pad(date.getMilliseconds(), 3);
      const time = `${h}:${m}:${s}.${ms}`;
  
      const logLine = document.createElement('div');
      logLine.textContent = `[${time}] ${message}`;
  
      // Log events in reverse chronological order
      this.logElement.insertBefore(logLine, this.logElement.firstChild);
    }


    addListener(element) {
        if (this.listener) {
            console.log(`Listener already exists.`);
            return;
        }
        chrome.runtime.sendMessage({ type: "startRecording" });
        this.listener = {element};

        this.renderTracking();
        console.log(`Added listener on element.`);
        this.logMessage(`Created "${element}"\n$`);
    }

    removeListener() {
        if (this.listener) {
          const { element, type, handler } = this.listener;
          element.removeEventListener(type, handler);
          console.log(`Removed listener for ${type}.`);
          this.listener = null; // Clear the reference
          
          //Clear all cancel button
          const buttonElements = document.querySelectorAll('.alarm-row__cancel-button');
          buttonElements.forEach(element => {
            element.remove();
          });

          chrome.runtime.sendMessage({ type: "stopRecording" });
        } else {
          console.log("No active listener to remove.");
        }
      }

    renderTracking() {
        //isRecoding template
        const trackEl = document.createElement('div');
    
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('alarm-row__cancel-button');
        cancelButton.textContent = 'cancel';

        cancelButton.addEventListener("click", () => {
            alert("Button clicked!");
            this.removeListener();
        });
        trackEl.appendChild(cancelButton);
    
        const targetSection = document.getElementById("button1");
        targetSection.appendChild(trackEl);
      }
}


startButton.onclick = () => {
  const manager = new TrackingManager(log);
  manager.addListener(document);
}


chrome.storage.local.get(["isRecoding"]).then((result) => {
  const manager = new TrackingManager(log);
  console.log("Value is " + result.isRecoding);
  if (result.isRecoding === 'true') {
    manager.addListener(document);
  }
});