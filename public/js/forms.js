document
    .querySelectorAll('input')
    .forEach(input => {
        input.addEventListener('input', function () {
            // Reset the custom validity message
            this.setCustomValidity('');
        });
    });

var modal = document.getElementById("termsModal");
var btn = document.getElementById("termsButton");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
