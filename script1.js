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

const characters = [];
const synopses = [];
const cells = [];
let editSynopsisBtn;
let addRowBtn;

document.addEventListener('DOMContentLoaded', () => {
    loadCellState();
    loadTableState();
    loadSynopsisState();
    editSynopsisBtn = document.getElementById('edit-synopsis-btn');
    addRowBtn = document.getElementById('add-character-btn');
    document.getElementById('add-info-btn').addEventListener('click', generateInfoCell);
    document.getElementById('add-character-btn').addEventListener('click', generateRow);
    document.querySelector('.add-text-btn').addEventListener('click', generateText);
    document.querySelector('.add-img-btn').addEventListener('click', generateImage);
    document.getElementById('edit-infobox').addEventListener('click', editPage);
    document.getElementById('edit-synopsis-btn').addEventListener('click', editAllSynopsisText);
    document.getElementById('table1').addEventListener('click', handleSynopsisClick);
    document.getElementById('table1').addEventListener('change', handleSynopsisChange);
    document.getElementById('info-list').addEventListener('change', handleCellChange);
    document.getElementById('table-body').addEventListener('click', handleTableClick);
    document.getElementById('table-body').addEventListener('change', handleTableChange);
});

function generateInfoCell() {
    const template = document.getElementById('info-template').content.cloneNode(true);
    const newId = Date.now();

    const newCell = {
        id: newId,
        text1: 'Write here',
        text2: 'Write here'
    };
    cells.push(newCell);
    
    updateCell(template, newCell);
    document.getElementById('info-list').appendChild(template);
    saveTableState();
}

function updateCell(template, cell) {
    template.querySelector('.info-title').setAttribute('data-index', cell.id);
    template.querySelector('.info-title').textContent = cell.text1;
    template.querySelector('.info-input').value = cell.text1;
    template.querySelector('.value-cell').textContent = cell.text2;
    template.querySelector('.value-input').value = cell.text2;
}

function editPage() {
    const charControls = document.querySelectorAll('.character-name-controls');
    const addCellsBtn = document.getElementById('add-info-btn');
    const editButton = document.getElementById('edit-infobox');
    const editMode = editButton.textContent === '✏️';
    
    if (editMode) {
        addCellsBtn.style.display = 'block';
        editSynopsisBtn.style.display = 'block';
        addRowBtn.style.display = 'block';
        editButton.textContent = '✔️';
    } else {
        addCellsBtn.style.display = 'none';
        editSynopsisBtn.style.display = 'none';
        addRowBtn.style.display = 'none';
        editButton.textContent = '✏️';
    }
    
    charControls.forEach(control => {
        const charEditBtn = control.querySelector('.edit-row-btn');
        const charDeleteBtn = control.querySelector('.delete-btn');
        
        if (editMode)
        {
            charEditBtn.style.display = 'block';
            charDeleteBtn.style.display = 'block';
        } else {
            charEditBtn.style.display = 'none';
            charDeleteBtn.style.display = 'none';
        }
    });
    editInfoBox(editMode);
}

function editInfoBox(editMode) {
    const infoWrappers = document.querySelectorAll('.info-wrapper');
    
    infoWrappers.forEach(info => {
        const infoTitle = info.querySelector('.info-title');
        const infoInput = info.querySelector('.info-input');
        const valueCell = info.querySelector('.value-cell');
        const valueInput = info.querySelector('.value-input');
        
        if (editMode) {
            infoTitle.style.display = 'none';
            valueCell.style.display = 'none';
            infoInput.value = infoTitle.textContent;
            valueInput.value = valueCell.textContent;
            infoInput.style.display = 'inline';
            valueInput.style.display = 'inline';
        } else {
            const index = infoTitle.getAttribute('data-index');
            const cell = cells.find(el => el.id == index);
            cell.text1 = infoInput.value;
            cell.text2 = valueInput.value;
            infoTitle.style.display = 'inline';
            valueCell.style.display = 'inline';
            infoTitle.textContent = infoInput.value;
            valueCell.textContent = valueInput.value;
            infoInput.style.display = 'none';
            valueInput.style.display = 'none';
        }
    });
    saveTableState();
}

function generateText() {
    const template = document.getElementById('Synopsis-text-template').content.cloneNode(true);
    const newId = Date.now();

    const newText = {
        id: newId,
        text: 'Write here'
    };
    synopses.push(newText);

    updateText(template, newText);
    document.getElementById('table1').appendChild(template);
    saveTableState();
}

function generateImage() {
    const template = document.getElementById('synopsis-img-template').content.cloneNode(true);
    const newId = Date.now();

    const newImage = {
        id: newId,
        imgSrc: 'https://via.placeholder.com/100'
    };
    synopses.push(newImage);

    updateImage(template, newImage);
    document.getElementById('table1').appendChild(template);
    saveTableState();
}

function handleSynopsisClick(event) {
    const target = event.target;
    if (target.classList.contains('change-img-btn')) {
        const input = target.closest('.synopsis-img-wrapper').querySelector('.change-img');
        input.click();
    } else if (target.classList.contains('delete-img-btn')) {
        const wrapper = target.closest('.synopsis-img-wrapper');
        deleteImage(wrapper);
    }
}

function handleSynopsisChange(event) {
    const target = event.target;
    const index = target.closest('.synopsis-img-wrapper').querySelector('img').dataset.index;
    const synopsisElement = synopses.find(el => el.id == index);

    if (target.classList.contains('change-img')) {
        loadImage(event, synopsisElement, 'synopsis');
    } else if (target.classList.contains('synopsis-text-input')) {
        const textElement = target.closest('.synopsis-wrapper').querySelector('.synopsis-text');
        synopsisElement.text = target.value;
        textElement.textContent = target.value;
        saveTableState();
    }
}

function handleCellChange(event) {
    const target = event.target;
    const index = target.closest('.info-title').getAttribute('data-index');
    const cell = cells.find(el => el.id == index);

    if (target.classList.contains('info-input')) {
        cell.text1 = target.value;
        target.closest('.info-wrapper').querySelector('.info-cell').textContent = target.value;
    } else if (target.classList.contains('value-input')) {
        cell.text2 = target.value;
        target.closest('.value-wrapper').querySelector('.value-cell').textContent = target.value;
    }
    saveTableState();
}

function updateText(template, textElement) {
    template.querySelector('.synopsis-text').setAttribute('data-index', textElement.id);
    template.querySelector('.synopsis-text').textContent = textElement.text;
    template.querySelector('.synopsis-text-input').value = textElement.text;
}

function updateImage(template, imageElement) {
    const img = template.querySelector('img');
    img.setAttribute('data-index', imageElement.id);
    img.src = imageElement.imgSrc;
}

function editAllSynopsisText() {
    const textWrappers = document.querySelectorAll('.synopsis-wrapper');
    const imgWrappers = document.querySelectorAll('.synopsis-img-wrapper');
    const addTextBtn = document.querySelector('.add-text-btn');
    const addImageBtn = document.querySelector('.add-img-btn');
    const editSynopsisMode = editSynopsisBtn.textContent === '✏️';
    
    if (editSynopsisMode) {
        addTextBtn.style.display = 'block';
        addImageBtn.style.display = 'block';
        editSynopsisBtn.textContent = '✔️';
    } else {
        addTextBtn.style.display = 'none';
        addImageBtn.style.display = 'none';
        editSynopsisBtn.textContent = '✏️';
    }
    
    textWrappers.forEach(wrapper => {
        const textElement = wrapper.querySelector('.synopsis-text');
        const inputElement = wrapper.querySelector('.synopsis-text-input');

        if (editSynopsisMode) {
            inputElement.style.display = 'block';
            inputElement.value = textElement.textContent;
            textElement.style.display = 'none';
        } else {
            const index = textElement.getAttribute('data-index');
            const synopsisElement = synopses.find(el => el.id == index);
            synopsisElement.text = inputElement.value;
            textElement.textContent = inputElement.value;

            if (!inputElement.value.trim()) {
                const wrapper = inputElement.closest('.synopsis-wrapper');
                wrapper.remove();
                
                const synopsisIndex = synopses.findIndex(el => el.id == index);
                if (synopsisIndex !== -1) {
                    synopses.splice(synopsisIndex, 1);
                }
            } else {
                textElement.textContent = inputElement.value;
                inputElement.style.display = 'none';
                textElement.style.display = 'block';
            }
        }
    });
    imgWrappers.forEach(wrapper => {
        const changeImgBtn = wrapper.querySelector('.change-img-btn');
        const deleteImgBtn = wrapper.querySelector('.delete-img-btn');
        
        if (editSynopsisMode) {
          changeImgBtn.style.display = 'block';
          deleteImgBtn.style.display = 'block';
        } else {
          changeImgBtn.style.display = 'none';
          deleteImgBtn.style.display = 'none';
        }
    })
}

function deleteImage(wrapper) {
    const imgElement = wrapper.querySelector('img');
    const index = imgElement.getAttribute('data-index');
    
    wrapper.remove();
    
    const imageIndex = synopses.findIndex(el => el.id == index);
    if (imageIndex !== -1) {
        synopses.splice(imageIndex, 1);
    }
}

function loadCellState() {
    const savedCells = JSON.parse(localStorage.getItem('cells'));
    if (savedCells) {
        savedCells.forEach(cell => {
            const template = document.getElementById('info-template').content.cloneNode(true);
            updateCell(template, cell);
            const cellWrapper = template.querySelector('.info-wrapper')
            cellWrapper.querySelector('.info-title').style.display = 'inline';
            cellWrapper.querySelector('.info-input').style.display = 'none';
            cellWrapper.querySelector('.value-cell').style.display = 'inline';
            cellWrapper.querySelector('.value-input').style.display = 'none';
            document.getElementById('info-list').appendChild(template);
        });
        cells.push(...savedCells);
    }
}

function loadSynopsisState() {
    const savedElements = JSON.parse(localStorage.getItem('synopses'));
    if (savedElements) {
        savedElements.forEach(element => {
            if (element.text) {
                const template = document.getElementById('Synopsis-text-template').content.cloneNode(true);
                updateText(template, element);
                const synopsisWrapper = template.querySelector('.synopsis-wrapper');
                synopsisWrapper.querySelector('.synopsis-text').style.display = 'block';
                synopsisWrapper.querySelector('.synopsis-text-input').style.display = 'none';
                document.getElementById('table1').appendChild(template);
            } else if (element.imgSrc) {
                const template = document.getElementById('synopsis-img-template').content.cloneNode(true);
                updateImage(template, element);
                const synopsisImgWrapper = template.querySelector('.synopsis-img-wrapper');
                synopsisImgWrapper.querySelector('.change-img-btn').style.display = 'none';
                synopsisImgWrapper.querySelector('.delete-img-btn').style.display = 'none';
                document.getElementById('table1').appendChild(template);
            }
        });
        synopses.push(...savedElements);
    }
}

function handleTableClick(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const character = characters.find(char => char.id == index);

    if (target.classList.contains('edit-row-btn')) {
        editRowContent(row, character);
    } else if (target.classList.contains('upload-img1-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'character');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('upload-img2-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'inspiration');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('move-up-btn')) {
        moveRowUp(row);
    } else if (target.classList.contains('move-down-btn')) {
        moveRowDown(row);
    } else if (target.classList.contains('see-more-btn')) {
        toggleBio(row);
    } else if (target.classList.contains('delete-btn')) {
        deleteRow(row, character);
    }
}

function handleTableChange(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const character = characters.find(char => char.id == index);

    if (target.classList.contains('upload-img')) {
        const type = target.getAttribute('data-type');
        loadImage(event, character, type);
    } else if (target.classList.contains('role-select')) {
        character.role = target.value;
    } else if (target.classList.contains('playable-select')) {
        character.playable = target.value;
    }
    saveTableState();
}

function generateRow() {
    const template = document.getElementById('Character-template').content.cloneNode(true);
    const newId = Date.now();

    const newCharacter = {
        id: newId,
        name: 'New Character',
        bio: 'New character bio goes here...',
        imgSrc: 'https://via.placeholder.com/100',
        inspirationImgSrc: 'https://via.placeholder.com/100',
        role: 'Unknown',
        playable: 'Yes'
    };
    characters.push(newCharacter);

    updateRow(template, newCharacter);
    document.getElementById('table-body').appendChild(template);
    saveTableState();
}

function updateRow(template, character) {
    template.querySelector('.character-wrapper').setAttribute('data-index', character.id);
    template.querySelector('.character-name').textContent = character.name;
    template.querySelector('.character-bio-text').textContent = character.bio;
    template.querySelector('.character-img').src = character.imgSrc;
    template.querySelector('.inspiration-img').src = character.inspirationImgSrc;
    template.querySelector('.role-select').value = character.role;
    template.querySelector('.playable-select').value = character.playable;
}

function editRowContent(row, character) {
    const nameElement = row.querySelector('.character-name');
    const inputElement = row.querySelector('.name-input');
    const bioElement = row.querySelector('.character-bio-text');
    const bioInputElement = row.querySelector('.bio-input');
    editRowBtn = row.querySelector('.edit-row-btn');
    moveUpBtn = row.querySelector('.move-up-btn');
    moveDownBtn = row.querySelector('.move-down-btn');
    uploadImgBtn1 = row.querySelector('.upload-img1-btn');
    uploadImgBtn2 = row.querySelector('.upload-img2-btn');
    editRowMode = editRowBtn.textContent === '✏️';

    if (editRowMode) {
        inputElement.style.display = 'inline';
        bioInputElement.style.display = 'inline';
        inputElement.value = character.name;
        bioInputElement.value = character.bio;
        moveUpBtn.style.display = 'block';
        moveDownBtn.style.display = 'block';
        uploadImgBtn1.style.display = 'block';
        uploadImgBtn2.style.display = 'block';
        nameElement.style.display = 'none';
        bioElement.style.display = 'none';
        editRowBtn.textContent = '✔️';
    } else {
        character.name = inputElement.value;
        character.bio = bioInputElement.value;
        nameElement.textContent = character.name;
        bioElement.textContent = character.bio;
        inputElement.style.display = 'none';
        bioInputElement.style.display = 'none';
        moveUpBtn.style.display = 'none';
        moveDownBtn.style.display = 'none';
        uploadImgBtn1.style.display = 'none';
        uploadImgBtn2.style.display = 'none';
        nameElement.style.display = 'block';
        bioElement.style.display = 'block';
        editRowBtn.textContent = '✏️';
    }
    saveTableState();
}

function loadImage(event, element, type) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'character') {
            element.imgSrc = e.target.result;
            const row = document.querySelector(`tr[data-index="${element.id}"]`);
            row.querySelector('.character-img').src = element.imgSrc;
        } else if (type === 'inspiration') {
            element.inspirationImgSrc = e.target.result;
            const row = document.querySelector(`tr[data-index="${element.id}"]`);
            row.querySelector('.inspiration-img').src = element.inspirationImgSrc;
        } else if (type === 'synopsis') {
            element.imgSrc = e.target.result;
            const imgElement = document.querySelector(`img[data-index="${element.id}"]`);
            imgElement.src = element.imgSrc;
        }
    };
    reader.readAsDataURL(file);
}

function moveRowUp(row) {
    const previousRow = row.previousElementSibling;
    if (previousRow) {
        row.parentNode.insertBefore(row, previousRow);
        updateCharactersArray();
    }
}

function moveRowDown(row) {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
        row.parentNode.insertBefore(nextRow, row);
        updateCharactersArray();
    }
}

function updateCharactersArray() {
    const rows = document.querySelectorAll('#table-body tr');
    const updatedCharacters = [];
    
    rows.forEach(row => {
        const index = row.dataset.index;
        const character = characters.find(char => char.id == index);
        if (character) {
            updatedCharacters.push(character);
        }
    });

    characters.length = 0;
    characters.push(...updatedCharacters);
}

function toggleBio(row) {
    const bioElement = row.querySelector('.character-bio');
    const btnElement = row.querySelector('.see-more-btn');

    if (bioElement.style.maxHeight) {
        bioElement.style.maxHeight = null;
        btnElement.textContent = 'show more';
    } else {
        bioElement.style.maxHeight = bioElement.scrollHeight + 'px';
        btnElement.textContent = 'show less';
    }
}

function deleteRow(row, character) {
    if (confirm('Are you sure you want to delete this character?')) {
        row.remove();
        characters.splice(characters.indexOf(character), 1);
    }
}

function loadTableState() {
    const savedCharacters = JSON.parse(localStorage.getItem('characters'));
    if (savedCharacters) {
        savedCharacters.forEach(character => {
            const template = document.getElementById('Character-template').content.cloneNode(true);
            updateRow(template, character);
            const editorWrapper = template.querySelector('.character-name-controls');
            editorWrapper.querySelector('.edit-row-btn').style.display = 'none';
            editorWrapper.querySelector('.delete-btn').style.display = 'none';
            document.getElementById('table-body').appendChild(template);
        });
        characters.push(...savedCharacters);
    }
}

function saveTableState() {
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('synopses', JSON.stringify(synopses));
    localStorage.setItem('cells', JSON.stringify(cells));
    alert("Saved changes!");
}

function clearSavedState() {
    if (confirm('Are you sure you want to delete the saved file?')) {
        localStorage.removeItem('characters');
        localStorage.removeItem('synopses');
        localStorage.removeItem('cells');
        location.reload();
    }
}