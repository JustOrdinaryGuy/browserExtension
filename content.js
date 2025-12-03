

// Copyright 2021 Google LLC
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

//DOM event bindings^
const feeds = document.querySelectorAll("[data-testid^='feedItem']");
//const buttons = document.querySelectorAll("[data-testid='likeBtn']")

// document.addEventListener("click", (event) => {
//     const clickInfo = {
//         x: event.clientX,
//         y: event.clientY,
//         target: event.target.tagName,
//         timestamp: Date.now()
//     };
//     console.log("Mouse click recorded:", clickInfo);

//     // Optionally, send the data to the background script for storage or processing
//     chrome.runtime.sendMessage({ type: "recordClick", data: clickInfo });
// });

for (let feed of feeds) {
    var button = feed.querySelector("[data-testid='likeBtn']");
    // Find the anchor tag inside the div
    const link = feed.querySelector('a');
    const hrefValue = link ? link.href : null;
    button.addEventListener("click", (event) => {
        const clickInfo = {
            x: event.clientX,
            y: event.clientY,
            target: event.target.tagName,
            link: hrefValue,
            timestamp: Date.now()
        };
        console.log("Button click recorded:", clickInfo);
    
        // Optionally, send the data to the background script for storage or processing
        chrome.runtime.sendMessage({ type: "recordClick", data: clickInfo });
    });
}
