function changeName(index) {
    var nameElement = document.getElementById('character-name-' + index);
    var inputElement = document.getElementById('name-input-' + index);
    var bioElement = document.getElementById('character-bio-text-' + index);
    var bioInputElement = document.getElementById('bio-input-' + index);

    if (inputElement.style.display === 'none' && bioInputElement.style.display === 'none') {
        inputElement.style.display = 'inline';
        inputElement.value = nameElement.innerText;
        inputElement.classList.add('input-large');
        nameElement.style.display = 'none';

        bioInputElement.style.display = 'inline';
        bioInputElement.value = bioElement.innerText;
        bioInputElement.classList.add('input-large');
        bioElement.style.display = 'none';
    } else {
        nameElement.innerText = inputElement.value;
        nameElement.style.display = 'block';
        inputElement.style.display = 'none';
        inputElement.classList.remove('input-large');

        bioElement.innerText = bioInputElement.value;
        bioElement.style.display = 'block';
        bioInputElement.style.display = 'none';
        bioInputElement.classList.remove('input-large');

        saveTableState();
    }
}

function moveRowUp(index) {
    var row = document.querySelector(`[data-index="${index}"]`);
    if (row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
        saveTableState();
    }
}

function moveRowDown(index) {
    var row = document.querySelector(`[data-index="${index}"]`);
    if (row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
        saveTableState();
    }
}

function adjustBioHeight(bioId) {
    var bioElement = document.getElementById(bioId);
    var bioHeight = bioElement.scrollHeight;
    bioElement.style.maxHeight = bioHeight + 'px';
}

function toggleTable(tableId, buttonId) {
    var table = document.getElementById(tableId);
    var button = document.getElementById(buttonId);
    if (table.style.display === "none") {
        table.style.display = "table";
        button.innerHTML = "🔻";
    } else {
        table.style.display = "none";
        button.innerHTML = "🔺️";
    }
}

function changeSrc() {
    if (document.getElementById("poster1button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/zrJMsVY/20240530-194859.jpg";
        document.getElementById("posterLink").href = "https://i.ibb.co/zrJMsVY/20240530-194859.jpg";
    } else if (document.getElementById("poster2button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/2YzpY9v/20240530-193537.jpg";
        document.getElementById("posterLink").href = "https://i.ibb.co/2YzpY9v/20240530-193537.jpg";
    }
    saveImageState();
}

function toggleBio(bioId) {
    var bioElement = document.getElementById(bioId);
    var btnElement = document.getElementById('btn_' + bioId);
    if (bioElement.style.maxHeight) {
        bioElement.style.maxHeight = null;
        btnElement.innerHTML = 'show more';
    } else {
        adjustBioHeight(bioId);
        btnElement.innerHTML = 'show less';
    }
}

function loadImage(event, imgId) {
    var image = document.getElementById(imgId);
    image.src = URL.createObjectURL(event.target.files[0]);
    saveImageState();
}

function saveTableState() {
    var table = document.getElementById("table2");
    var rows = table.querySelectorAll("tr");
    var tableData = [];
    rows.forEach(row => {
        tableData.push(row.outerHTML);
    });
    localStorage.setItem("tableState", JSON.stringify(tableData));
}

function loadTableState() {
    var tableData = JSON.parse(localStorage.getItem("tableState"));
    if (tableData) {
        var table = document.getElementById("table2");
        table.innerHTML = "";
        tableData.forEach(rowHTML => {
            table.innerHTML += rowHTML;
        });
    }
}

function saveImageState() {
    var images = document.querySelectorAll(".character-img");
    var imageData = [];
    images.forEach(img => {
        imageData.push({
            id: img.id,
            src: img.src
        });
    });
    localStorage.setItem("imageState", JSON.stringify(imageData));
}

function loadImageState() {
    var imageData = JSON.parse(localStorage.getItem("imageState"));
    if (imageData) {
        imageData.forEach(imgData => {
            var img = document.getElementById(imgData.id);
            img.src = imgData.src;
        });
    }
}

function getCurrentIndex() {
    var currentIndex = localStorage.getItem("currentIndex");
    if (!currentIndex) {
        currentIndex = 0;
    }
    return parseInt(currentIndex);
}

function updateCurrentIndex(index) {
    localStorage.setItem("currentIndex", index);
}

function generateRow() {
    var table = document.getElementById('table2');
    var currentIndex = getCurrentIndex();
    var newRow = document.createElement('tr');
    var rowIndex = currentIndex + 1;
    newRow.setAttribute('data-index', rowIndex);
    newRow.innerHTML = `
        <td>
            <div class="character-profile">
                <h3 id="character-name-${rowIndex}">New Character</h3>
                <input type="text" id="name-input-${rowIndex}" style="display: none;" placeholder="Enter new name">
                <div class="character-name">
                    <button onclick="changeName(${rowIndex})">✏️</button>
                    <input type="file" id="upload-new-${rowIndex}" style="display: none;" accept="image/*" onchange="loadImage(event, 'new-img-${rowIndex}')">
                    <button onclick="document.getElementById('upload-new-${rowIndex}').click()">📷</button>
                    <button onclick="moveRowUp(${rowIndex})">⬆️</button>
                    <button onclick="moveRowDown(${rowIndex})">⬇️</button>
                </div> 
                <img id="new-img-${rowIndex}" src="https://via.placeholder.com/100" class="character-img" alt="New Character">
            </div>
            <div class="character-bio" id="bio_new_${rowIndex}" onclick="adjustBioHeight('bio_new_${rowIndex}')">
                <p id="character-bio-text-${rowIndex}">New character bio goes here...</p>
                <input type="text" id="bio-input-${rowIndex}" style="display: none;" placeholder="Write a bio">
                <div style="display: flex;">
                    <div class="info-cell"><b>Role</b></div>
                    <div class="info-cell-value">Unknown</div>
                </div>
                <div style="display: flex;">
                    <div class="info-cell"><b>Playable</b></div>
                    <div class="info-cell-value">No</div>
                </div>
                <div style="display: flex;">
                    <div class="info-cell"><b>Face inspiration</b></div>
                    <div class="info-cell-value">
                        <img src="https://via.placeholder.com/100" alt="Placeholder" width="100%">
                        <a href="#">Placeholder</a>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <span class="see-more-btn" id="btn_bio_new_${rowIndex}" onclick="toggleBio('bio_new_${rowIndex}')">show more</span>
            </div>
        </td>`;
    table.appendChild(newRow);
    updateCurrentIndex(rowIndex);
    saveTableState();
}

document.addEventListener("DOMContentLoaded", function() {
    loadTableState();
    loadImageState();
});

function clearSavedState() {
    localStorage.removeItem("tableState");
    localStorage.removeItem("imageState");
    location.reload();
}