// Initial welcome page. Delete the following line to remove it.
"use strict";

async function render() {
    appendChildren();

    const rootDiv = document.getElementById("app");
    const para = document.createElement("p");

    fetch("http://localhost:9000")
        .then((res) => res.json())
        .then((response) => {
            para.textContent = `Status: ${response?.status}, Data: ${response?.data}`;
        })
        .catch((err) => {
            console.error("Failed to fetch: ", err);
        });

    rootDiv.appendChild(para);
}

window.addEventListener("load", render);

function appendChildren() {
    const rootDiv = document.getElementById("app");

    for (let i = 0; i < 3; i++) {
        const element = document.createElement("h1");
        element.textContent = "This was created from JS!" + i;

        rootDiv.appendChild(element);
    }
}
