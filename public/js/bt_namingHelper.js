let currentFileName = getQueryParam('file') || '';
const title = currentFileName || "document";


function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

window.addEventListener('DOMContentLoaded', () => {
  const fileName = getQueryParam('file');
  if (fileName) {
    loadFileFromServer(fileName);
  }
});


// Modal scripts below

function openFileNameModal(callback) {
  const modal = document.getElementById("fileNameModal");
  modal.style.display = "flex";
  modal.dataset.callback = callback.name;
}

function closeFileNameModal() {
  document.getElementById("fileNameModal").style.display = "none";
}

function confirmFileName() {
  const name = document.getElementById("fileNameInput").value.trim();
  if (!name) {
    alert("Please enter a valid file name.");
    return;
  }

  currentFileName = name;
  closeFileNameModal();

  const callbackName = document.getElementById("fileNameModal").dataset.callback;
  if (callbackName && typeof window[callbackName] === 'function') {
    window[callbackName]();
  }
}


