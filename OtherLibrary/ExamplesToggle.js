let enabled = false;

function toggleExamples() {
    enabled = !enabled;
    let examplesButton = document.getElementById("examplesButton");
    examplesButton.style.backgroundImage =
        enabled ? "url('icons/examples-selected.png')" : "url('icons/examples.png')";
    let examplesModal = document.getElementById("examplesModal");
    examplesModal.style.display = enabled ? "flex" : "none";
}