// Initial welcome page. Delete the following line to remove it.
"use strict";

function appendChildren() {
    const rootDiv = document.getElementById("app");

    for (let i = 0; i < 3; i++) {
        const element = document.createElement("h1");
        element.textContent = "This was created from JS!" + i;

        rootDiv.appendChild(element);
    }
}

window.addEventListener("load", appendChildren);
