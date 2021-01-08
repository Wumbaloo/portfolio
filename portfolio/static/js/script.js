document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});
    let x = document.getElementById("snackbar");

    if (x) {
        x.className = "show";
        setTimeout(() => {
            x.className = x.className.replace("show", "");
        }, 3000);
    }
});