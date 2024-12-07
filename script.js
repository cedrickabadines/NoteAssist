// Global variables
let notepad = document.getElementById("notepad");
let templateList = document.getElementById("templateList");
let templateEditor = document.getElementById("templateEditor");
let templateNameInput = document.getElementById("templateNameInput");
let templateContentInput = document.getElementById("templateContentInput");
let history = JSON.parse(localStorage.getItem("history")) || [];
let templates = JSON.parse(localStorage.getItem("templates")) || [{ name: "Default", content: "" }];
let editingTemplateIndex = null;
let defaultTemplateIndex = templates.findIndex(template => template.name === "Default");

// Button Handlers
document.getElementById("loadDefaultTemplateBtn").addEventListener("click", loadDefaultTemplate);
document.getElementById("saveBtn").addEventListener("click", saveNote);
document.getElementById("historyBtn").addEventListener("click", toggleHistory);
document.getElementById("createTemplateBtn").addEventListener("click", showTemplateEditor);
document.getElementById("saveTemplateBtn").addEventListener("click", saveTemplate);
document.getElementById("cancelTemplateBtn").addEventListener("click", cancelTemplate);
document.getElementById("helpBtn").addEventListener("click", showHelp);
document.getElementById("aboutBtn").addEventListener("click", showAbout);
document.getElementById("closeHelpBtn").addEventListener("click", closeHelp);
document.getElementById("closeAboutBtn").addEventListener("click", closeAbout);
notepad.addEventListener("input", autosaveNote);

// Check if there is any saved note in localStorage when the page loads
window.addEventListener("load", loadAutosaveNote);
let autosaveInterval = setInterval(autosaveNote, 2000); // Autosave every 5 seconds

// Functions
function loadDefaultTemplate() {
    notepad.value = templates[defaultTemplateIndex].content || "";  // Load content of the default template (empty if not set)
}

function clearNotepad() {
    notepad.value = "";
}

// Function to autosave the note to localStorage
function autosaveNote() {
    const note = notepad.value; // Get the content of the text area
    if (note.trim()) {
        // Save the note to localStorage (you can save it under a key like "autosaveNote")
        localStorage.setItem("autosaveNote", note);
    }
}

// Function to load the autosaved note from localStorage
function loadAutosaveNote() {
    const savedNote = localStorage.getItem("autosaveNote"); // Get saved content from localStorage
    if (savedNote) {
        notepad.value = savedNote; // Set the saved content as the text area value
    }
}

// Optional: Clear the saved note when the user manually saves or clears the note
function saveNote() {
    const note = notepad.value;
    if (note.trim()) {
        let timestamp = Date.now();
        history.push({ note, timestamp });
        localStorage.setItem("history", JSON.stringify(history)); // Save to localStorage
        notepad.value = "";  // Clear after saving
        localStorage.removeItem("autosaveNote"); // Clear the autosaved note after it's saved
    }
}

function toggleHistory() {
    let historySection = document.getElementById("historySection");

    // Toggle visibility of the history section
    historySection.classList.toggle("hidden");

    if (!historySection.classList.contains("hidden")) {
        // If history section is visible, populate it with saved notes
        displayHistory();
    }
}

function displayHistory() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = ''; // Clear the list

    let currentTime = Date.now();
    history.forEach((entry, index) => {
        let timeDifference = currentTime - entry.timestamp;
        let hoursPassed = timeDifference / (1000 * 60 * 60);

        // Only display notes within the last 24 hours
        if (hoursPassed < 24) {
            let li = document.createElement("li");
            li.classList.add("flex", "items-center", "justify-between", "border-b", "p-2");

            // Display the note and time passed in a span (flex-grow will make sure the text takes up available space)
            let noteText = document.createElement("span");
            noteText.classList.add("flex-grow");  // Make sure the note text expands to use available space
            noteText.textContent = `${entry.note} (Saved ${Math.floor(hoursPassed)} hours ago)`;
            li.appendChild(noteText);

            // Create Load button
            let loadButton = document.createElement("button");
            loadButton.textContent = "Load";
            loadButton.classList.add("bg-blue-500", "text-white", "px-2", "py-1", "rounded", "ml-2");
            loadButton.addEventListener("click", () => loadHistory(index)); // Pass index to load the specific note
            li.appendChild(loadButton);

            // Create Delete button
            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("bg-red-500", "text-white", "px-2", "py-1", "rounded", "ml-2");
            deleteButton.addEventListener("click", () => deleteHistory(index)); // Pass index to delete the specific note
            li.appendChild(deleteButton);

            // Append the list item to the history list
            historyList.appendChild(li);
        }
    });
}

function loadHistory(index) {
    let note = history[index].note;
    notepad.value = note;
    document.getElementById("historySection").classList.add("hidden");
}

function deleteHistory(index) {
    history.splice(index, 1);
    localStorage.setItem("history", JSON.stringify(history));
    displayHistory();
}

function copyText() {
    let notepad = document.getElementById("notepad");
    notepad.select();
    notepad.setSelectionRange(0, 99999);
    document.execCommand("copy");
    let copyButton = document.getElementById("copyBtn");
    copyButton.textContent = "Copied!";
    setTimeout(() => {
        copyButton.textContent = "Copy";
    }, 2000);
}

function showTemplateEditor() {
    templateNameInput.value = "";
    templateContentInput.value = "";
    editingTemplateIndex = null;
    templateEditor.classList.remove("hidden");
}

function saveTemplate() {
    const templateName = templateNameInput.value;
    const templateContent = templateContentInput.value;
    
    // Check if we are creating a new template and not editing
    if (editingTemplateIndex === null) {
        // Check if we have reached the maximum number of templates (5 including default)
        if (templates.length >= 5) {
            alert("You can only have up to 5 templates, including the default template.");
            return; // Prevent further execution
        }
    }

    if (templateName.trim() && templateContent.trim()) {
        if (editingTemplateIndex === null) {
            // Add new template
            templates.push({ name: templateName, content: templateContent });
        } else {
            // Edit existing template
            templates[editingTemplateIndex] = { name: templateName, content: templateContent };
        }

        localStorage.setItem("templates", JSON.stringify(templates));
        templateEditor.classList.add("hidden");
        renderTemplates(); // Re-render the templates list
    } else {
        alert("Both name and content are required.");
    }
}


function cancelTemplate() {
    templateEditor.classList.add("hidden");
}

function renderTemplates() {
    templateList.innerHTML = '';  // Clear existing templates
    templates.forEach((template, index) => {
        let templateItem = document.createElement("div");
        templateItem.className = "flex justify-between items-center border p-2 rounded-md mb-2 bg-white";

        // If this template is the default, add a special background color
        if (index === defaultTemplateIndex) {
            templateItem.classList.add("bg-green-300");
        }

        let templateName = document.createElement("span");
        templateName.textContent = template.name;

        let buttonsDiv = document.createElement("div");
        buttonsDiv.className = "space-x-2";

        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "bg-yellow-500 text-white px-2 py-1 rounded-md";
        editBtn.onclick = () => editTemplate(index);

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "bg-red-500 text-white px-2 py-1 rounded-md";
        deleteBtn.onclick = () => deleteTemplate(index);

        let makeDefaultBtn = document.createElement("button");
        makeDefaultBtn.textContent = "Make Default";
        makeDefaultBtn.className = "bg-blue-500 text-white px-2 py-1 rounded-md";
        makeDefaultBtn.onclick = () => setAsDefault(index);

        if (template.name === "Default") {
            deleteBtn.disabled = true; // Disable delete for default template
        }

        
        buttonsDiv.appendChild(makeDefaultBtn);
        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);
        
        templateList.appendChild(templateItem);
        templateItem.appendChild(templateName);
        templateItem.appendChild(buttonsDiv);
    });
}

function editTemplate(index) {
    templateNameInput.value = templates[index].name;
    templateContentInput.value = templates[index].content;
    editingTemplateIndex = index;
    templateEditor.classList.remove("hidden");
}

function deleteTemplate(index) {
    if (templates[index].name === "Default") {
        alert("Default template cannot be deleted.");
        return;
    }

    // Delete the selected template
    templates.splice(index, 1);

    // If the deleted template was the default, set a new default template
    if (index === defaultTemplateIndex) {
        // If there are templates left, set the first one as default
        if (templates.length > 0) {
            defaultTemplateIndex = 0;
        } else {
            defaultTemplateIndex = null; // If there are no templates, there is no default
        }
    }

    // Save the updated templates and default template index to localStorage
    localStorage.setItem("templates", JSON.stringify(templates));
    localStorage.setItem("defaultTemplateIndex", defaultTemplateIndex);

    // Re-render the templates list
    renderTemplates();
}


function setAsDefault(index) {
    defaultTemplateIndex = index;
    localStorage.setItem("defaultTemplateIndex", defaultTemplateIndex);
    renderTemplates();  // Re-render the templates to reflect the change
}

function showHelp() {
    document.getElementById("helpPopup").classList.remove("hidden");
}

function closeHelp() {
    document.getElementById("helpPopup").classList.add("hidden");
}

function showAbout() {
    document.getElementById("aboutPopup").classList.remove("hidden");
}

function closeAbout() {
    document.getElementById("aboutPopup").classList.add("hidden");
}

// Initialize the template list on page load
renderTemplates();
