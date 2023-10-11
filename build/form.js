"use strict";
function openForm() {
    const form = document.getElementById("myForm");
    if (form !== null) {
        form.style.display = "block";
    }
}
function closeForm() {
    const form = document.getElementById("myForm");
    if (form !== null) {
        form.style.display = "none";
    }
}
