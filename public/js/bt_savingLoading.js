async function refreshToken() {
  try {
    const response = await fetch('/refresh', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json();
    return data.accessToken;
  } catch (err) {
    console.error('Token refresh failed:', err);
    return null;
  }
}

function getEditorContentAsJson() {
  const title = currentFileName || "document"; // ------------------------------------
  const editor = document.getElementById("editor");

  const lines = [];
  let currentLine = [];
  let lastStyle = null;

  function extractStyle(el) {
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      bold: style.fontWeight === "bold" || parseInt(style.fontWeight) >= 600,
      italic: style.fontStyle === "italic",
      underline: style.textDecoration.includes("underline"),
      fontSize: parseInt(style.fontSize)
    };
  }

  function stylesEqual(a, b) {
    if (!a || !b) return false;
    return a.color === b.color &&
           a.bold === b.bold &&
           a.italic === b.italic &&
           a.underline === b.underline &&
           a.fontSize === b.fontSize;
  }

  function pushChunk(text, style) {
    if (!text) return;
    // Merge text with same style if possible
    if (lastStyle && stylesEqual(lastStyle, style)) {
      currentLine[currentLine.length - 1].text += text;
    } else {
      currentLine.push({ text, style });
      lastStyle = style;
    }
  }

  // Push currentLine to lines; if empty line, push []
  function flushLine() {
    if (currentLine.length > 0) {
      lines.push(currentLine);
    } else {
      // Only add an empty line if the previous line is not empty
      if (lines.length === 0 || lines[lines.length - 1].length !== 0) {
        lines.push([]);
      }
    }
    currentLine = [];
    lastStyle = null;
  }

  // Recursively walk the editor DOM and build content lines
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      // Push text only if non-empty or contains spaces
      if (text.trim() !== "" || text.includes(" ")) {
        const style = extractStyle(node.parentElement || editor);
        pushChunk(text, style);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      if (tag === "BR") {
        flushLine();
      } else {
        node.childNodes.forEach(walk);
        if (tag === "DIV") {
          flushLine();
        }
      }
    }
  }

  editor.childNodes.forEach(walk);

  // Flush last line only if there is content (prevents trailing empty lines)
  if (currentLine.length > 0) {
    flushLine();
  }

  return {
    filename: title,
    content: lines
  };
}

async function saveFile() {
  if (!currentFileName) {
    openFileNameModal(saveFile);
    return;
  }

  const token = await refreshToken();
  if (!token) {
    if (confirm('You need to login to save. Return to login screen?')) {
      window.location.href = 'index';
    }
    return;
  }
  const jsonData = getEditorContentAsJson();
  
  try {
    const response = await fetch('/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName: currentFileName,
        fileData: jsonData.content
      })
    });

    if (!response.ok) throw new Error(await response.text());

    alert(`Document saved as ${currentFileName}`);
  } catch (err) {
    alert(`Save failed: ${err.message}`);
  }
}



function newFile() {
  document.getElementById("editor").innerHTML = "";
  currentFileName = "";

}

function openFile() {
  const fileInput = document.getElementById('fileInput');
  fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    currentFileName = nameWithoutExt; // since no longer using titleBox, 

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          loadStyledContent(parsed.content || parsed); // support both formats
        } catch {
          alert("Failed to load JSON content.");
        }
      } else {
        document.getElementById("editor").innerText = content;
      }
    };
    reader.readAsText(file);
  };
}

function loadStyledContent(lines) {
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  lines.forEach(line => {
    const div = document.createElement("div");
    if (line.length === 0) {
      // Use a non-breaking space for empty lines so they display properly
      div.innerHTML = "&nbsp;";
    } else {
      line.forEach(chunk => {
        const span = document.createElement("span");
        span.textContent = chunk.text;

        const { color, bold, italic, underline, fontSize } = chunk.style;
        span.style.color = color;
        span.style.fontWeight = bold ? "bold" : "normal";
        span.style.fontStyle = italic ? "italic" : "normal";
        span.style.textDecoration = underline ? "underline" : "none";
        span.style.fontSize = fontSize + "px";

        div.appendChild(span);
      });
    }
    editor.appendChild(div);
  });
}

function downloadFile() {
  const text = document.getElementById("editor").innerText;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = "document.txt";
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

async function loadFileFromServer(fileName) {
  try {
    const token = await refreshToken();
    if (!token) {
      if (confirm('Not logged in. Return to login screen?')) {
        window.location.href = 'index';
      }
      return;
    }

    const response = await fetch(`/assets/${fileName}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

    const { fileName: returnedFileName, content } = await response.json();

    loadStyledContent(content);
  } catch (err) {
    alert(`Error loading file: ${err.message}`);
  }
}
