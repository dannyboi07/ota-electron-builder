// Initial welcome page. Delete the following line to remove it.
"use strict";

function appendChildElement() {
    const element = document.createElement("h1");
    element.textContent = "This was created from JS!";

    document.getElementById("app").appendChild(element);
}

window.addEventListener("load", appendChildElement);
