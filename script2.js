function changeSrc() {
    if (document.getElementById("poster1button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/2YzpY9v/20240530-193537.jpg";
    } else if (document.getElementById("poster2button").checked) {
        document.getElementById("poster").src = "https://i.ibb.co/zrJMsVY/20240530-194859.jpg";
    }
    saveState();
}

function toggleTable(tableId, buttonId) {
    var table = document.getElementById(tableId);
    var button = document.getElementById(buttonId);
    if (table.style.display === "none") {
        table.style.display = "table";
        button.innerHTML = "⛔️";
    } else {
        table.style.display = "none";
        button.innerHTML = "️️👁";
    }
}

const dbName = 'gameData';
const dbVersion = 2;

let db;

function openDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('characters')) {
            const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('synopses')) {
            const synopsisStore = db.createObjectStore('synopses', { keyPath: 'id' });
        }
        const dataStore = db.createObjectStore('titles', {keyPath: 'pageId'});
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadState();
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };
}

function deleteElementFromDB(elementId, type) {
    const transaction = db.transaction(['characters', 'synopses'], 'readwrite');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');
    
    if (type === 'character') {
        characterStore.delete(elementId);
        const filteredCharacters = characters.filter(char => char.pageId === currentPageId);
        let previousPosition = -1;
      
        filteredCharacters.forEach(character => {
            if (character.position !== previousPosition + 1) {
                character.position = previousPosition + 1;
            }
            previousPosition = character.position;
        });
    } else if (type === 'synopsis') {
      synopsisStore.delete(elementId);
    }
    transaction.oncomplete = function() {
        console.log(type + ' deleted from IndexedDB');
    };

    transaction.onerror = function(event) {
        console.error('IndexedDB transaction error:', event.target.error);
    };
}

let titles = []
let characters = [];
let synopses = [];
const cells = [];
let foundedData;
let currentPageId;
let editSynopsisBtn;
let addRowBtn;
let addCell1Btn;
let editButton;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageIdString = urlParams.get('pageId');
    currentPageId = Number(pageIdString);
    openDB();
    loadCellState();
    
    const inputPoster = document.getElementById('poster-input');
    editButton = document.getElementById('edit-infobox');
    editSynopsisBtn = document.getElementById('edit-synopsis-btn');
    addRowBtn = document.getElementById('add-character-btn');
    addCell1Btn = document.getElementById('add-info-btn1');
    addCell1Btn.addEventListener('click', generateInfoCell);
    addRowBtn.addEventListener('click', generateRow);
    document.querySelector('.add-text-btn').addEventListener('click', generateText);
    document.querySelector('.add-img-btn').addEventListener('click', generateImage);
    editButton.addEventListener('click', editPage);
    document.getElementById('edit-synopsis-btn').addEventListener('click', editAllSynopsisText);
    document.getElementById('change-poster').addEventListener('click', () => {
      if (editButton.textContent === '✔️') {
          inputPoster.click();
      }
    });
    inputPoster.addEventListener('change', function () {
      const reader = new FileReader();
      const filteredData = titles.find(data => data.pageId === currentPageId);
      reader.onload = function(e) {
        filteredData.poster = e.target.result;
        document.getElementById('poster').src = filteredData.poster;
        saveState();
      }
      
      reader.readAsDataURL(this.files[0]);
    });
    document.getElementById('table1').addEventListener('click', handleSynopsisClick);
    document.getElementById('table1').addEventListener('change', handleSynopsisChange);
    document.getElementById('info-list').addEventListener('click', handleCellClick);
    document.getElementById('info-list').addEventListener('change', handleCellChange);
    document.getElementById('table-body').addEventListener('click', handleTableClick);
    document.getElementById('table-body').addEventListener('change', handleTableChange);
});

function generateInfoCell() {
    const template = document.getElementById('info-template').content.cloneNode(true);
    const newId = Date.now();
    const filteredCells = cells.filter(cell => cell.pageId === currentPageId);
    const newPosition = filteredCells.length ? filteredCells[filteredCells.length - 1].position + 1 : 0;

    const newCell = {
        id: newId,
        text1: 'Write here',
        text2: 'Write here',
        pageId: currentPageId,
        position: newPosition
    };
    cells.push(newCell);
    
    updateCell(template, newCell);
    document.getElementById('info-list').appendChild(template);
    saveState();
}

function updateCell(template, cell) {
    template.querySelector('.info-wrapper').setAttribute('data-index', cell.id);
    template.querySelector('.info-title').textContent = cell.text1;
    template.querySelector('.info-input').value = cell.text1;
    template.querySelector('.value-cell').textContent = cell.text2;
    template.querySelector('.value-input').value = cell.text2;
}

function editPage() {
    const controlRoom = document.querySelectorAll('.control-room');
    const title = document.getElementById('title');
    const introText = document.getElementById('intro');
    const titleInput = document.getElementById('title-input');
    const introInput = document.getElementById('intro-input');
    const editMode = editButton.textContent === '✏️';
    if (db) {
        if (editMode) {
            controlRoom.forEach(room => {
                room.style.display = 'block';
            });
            characters.forEach(character => {
              console.log(character.name + ': ' + character.position);
            });
            editSynopsisBtn.style.display = 'block';
            titleInput.value = title.textContent;
            introInput.value = introText.textContent;
            titleInput.style.display = 'inline';
            introInput.style.display = 'inline';
            title.style.display = 'none';
            introText.style.display = 'none';
            editButton.textContent = '✔️';
        } else {
            controlRoom.forEach(room => {
                room.style.display = 'none';
            });
            editSynopsisBtn.style.display = 'none';
            foundedData.title = titleInput.value;
            foundedData.intro = introInput.value;
            title.textContent = foundedData.title;
            introText.textContent = foundedData.intro;
            titleInput.style.display = 'none';
            introInput.style.display = 'none';
            title.style.display = 'block';
            introText.style.display = 'block';
            editButton.textContent = '✏️';
        }
        
        characterEdit(editMode);
        editInfoBox(editMode);
    }
}

function characterEdit(editMode) {
    const characterTemplate = document.querySelectorAll('.character-wrapper');
    
    characterTemplate.forEach(template => {
        let characterEditMode = template.querySelector('.character-name');
        let characterName = template.querySelector('.character-name');
        let characterBio = template.querySelector('.character-bio-text');
        let characterNameInput = template.querySelector('.name-input');
        let characterBioInput = template.querySelector('.bio-input');
        let charControls = template.querySelector('.character-name-controls');
        
        if (editMode) {
            characterName.style.display = 'none';
            characterBio.style.display = 'none';
            charControls.style.display = 'block';
            characterNameInput.value = characterName.textContent;
            characterBioInput.value = characterBio.textContent;
            characterNameInput.style.display = 'inline';
            characterBioInput.style.display = 'inline';
        } else {
            const index = template.getAttribute('data-index');
            const character = characters.find(char => char.id == index);
            characterNameInput.style.display = 'none';
            characterBioInput.style.display = 'none';
            charControls.style.display = 'none';
            
            if (characterNameInput.value.trim()) {
                character.name = characterNameInput.value;
                characterName.textContent = characterNameInput.value;
            }
            
            if (characterBioInput.value.trim()) {
                character.bio = characterBioInput.value;
                characterBio.textContent = characterBioInput.value;
            }
            
            characterName.style.display = 'block';
            characterBio.style.display = 'block';
        }
    });
}

function editInfoBox(editMode) {
    const infoWrappers = document.querySelectorAll('.info-wrapper');
    
    infoWrappers.forEach(info => {
        const infoTitle = info.querySelector('.info-title');
        const valueCell = info.querySelector('.value-cell');
        const inputWrapper = info.querySelectorAll('.cell-input-wrapper');
        const cell1 = info.querySelector('.cell1');
        const cell2 = info.querySelector('.cell2');
        const infoInput = info.querySelector('.info-input');
        const valueInput = info.querySelector('.value-input');
        
        if (editMode) {
            cell1.style.backgroundColor = "white";
            cell2.style.backgroundColor = 'white';
            infoTitle.style.display = 'none';
            valueCell.style.display = 'none';
            infoInput.value = infoTitle.textContent;
            valueInput.value = valueCell.textContent;
            inputWrapper.forEach(input => {
              input.style.display = 'inline';
            });
        } else {
            const index = infoTitle.closest('.info-wrapper').getAttribute('data-index');
            const cell = cells.find(el => el.id == index);
            cell.text1 = infoInput.value;
            cell.text2 = valueInput.value;
            if (!infoInput.value.trim() && !valueInput.value.trim()) {
                const wrapper = infoInput.closest('.info-wrapper');
                wrapper.remove();
                const cellIndex = cells.findIndex(el => el.id == index);
                cells.splice(cellIndex, 1);
            } else {
                cell1.style.backgroundColor = '#F1e7dd';
                cell2.style.backgroundColor = '#F1e7dd';
                infoTitle.style.display = 'inline';
                valueCell.style.display = 'inline';
                infoTitle.textContent = infoInput.value;
                valueCell.textContent = valueInput.value;
                inputWrapper.forEach(input => {
                  input.style.display = 'none';
                })
            }
        }
    });
    saveState();
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
    saveState();
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
    saveState();
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
        saveState();
    }
}

function handleCellClick(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const cell = cells.find(el => el.id == index);
    
    if (target.classList.contains('cell-up-btn')) {
        moveCell(row, cell, 'up');
    } else if (target.classList.contains('cell-down-btn')) {
        moveCell(row, cell, 'down');
    }
}

function handleCellChange(event) {
    const target = event.target;
    const index = target.closest('.info-wrapper').getAttribute('data-index');
    const cell = cells.find(el => el.id == index);

    if (target.classList.contains('info-input')) {
        cell.text1 = target.value;
        target.closest('.info-wrapper').querySelector('.info-cell').textContent = target.value;
    } else if (target.classList.contains('value-input')) {
        cell.text2 = target.value;
        target.closest('.value-wrapper').querySelector('.value-cell').textContent = target.value;
    }
    saveState();
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
                deleteElementFromDB(synopsisElement.id, 'synopsis')
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
    });
    saveState();
}

function deleteImage(wrapper) {
    const imgElement = wrapper.querySelector('img');
    const index = imgElement.getAttribute('data-index')
    const image = synopses.find(img => img.id == index);
    
    wrapper.remove();
    
    synopses.splice(synopses.indexOf(image), 1);
    deleteElementFromDB(image.id, 'synopsis');
}

function handleTableClick(event) {
    const target = event.target;
    const row = target.closest('tr');
    const index = row ? row.dataset.index : null;
    const character = characters.find(char => char.id == index);

    if (target.classList.contains('upload-img1-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'character');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('upload-img2-btn')) {
        row.querySelector('.upload-img').setAttribute('data-type', 'inspiration');
        row.querySelector('.upload-img').click();
    } else if (target.classList.contains('move-up-btn')) {
        moveRow(row, character, 'up');
    } else if (target.classList.contains('move-down-btn')) {
        moveRow(row, character, 'down');
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
    saveState();
}

function generateRow() {
    const template = document.getElementById('character-template').content.cloneNode(true);
    const newId = Date.now();
    const filteredCharacters = characters.filter(char => char.pageId === currentPageId);
    filteredCharacters.forEach(Character => {
      console.log(Character.name + ': ' + Character.position);
    })
    const newPosition = filteredCharacters.length ? filteredCharacters[filteredCharacters.length - 1].position + 1 : 0;

    const newCharacter = {
        id: newId,
        name: 'New Character ' + newPosition,
        bio: 'New character bio goes here...',
        imgSrc: 'https://via.placeholder.com/100',
        inspirationImgSrc: 'https://via.placeholder.com/100',
        role: 'Unknown',
        playable: 'Yes',
        position: newPosition,
        pageId: currentPageId
    };
    characters.push(newCharacter);

    updateRow(template, newCharacter);
    document.getElementById('table-body').appendChild(template);
    saveState();
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

function moveCell(row, currentCell, type) {
    const previousRow = row.previousElementSibling;
    const nextRow = row.nextElementSibling;
    if (type === 'up' && previousRow) {
        const previousIndex = Number(previousRow.dataset.index);
        const previousCell = cells.find(el => el.id === previousIndex);
        
        const currentPosition = currentCell.position;
        currentCell.position = previousCell.position;
        previousCell.position = currentPosition;
    
        row.parentNode.insertBefore(row, previousRow);
    } else if (type === 'down' && nextRow) {
        const nextIndex = Number(nextRow.dataset.index);
        const nextCell = cells.find(el => el.id === nextIndex);
        
        const currentPosition = currentCell.position;
        currentCell.position = nextCell.position;
        nextCell.position = currentPosition;
    
        row.parentNode.insertBefore(nextRow, row);
    } else {
        let previousPosition = -1;
        
        cells.forEach(cell => {
            if (cell.position !== previousPosition + 1) {
                cell.position = previousPosition + 1;
            }
            previousPosition = cell.position;
        });
    }
    saveState();
}

function moveRow(row, character, type) {
    const previousRow = row.previousElementSibling;
    const nextRow = row.nextElementSibling;
    if (type === 'up' && previousRow) {
        const previousIndex = Number(previousRow.dataset.index);
        const previousCharacter = characters.find(char => char.id === previousIndex);
        
        const currentPosition = character.position;
        character.position = previousCharacter.position;
        previousCharacter.position = currentPosition;
        console.log(character.position + ': ' + previousCharacter.position);
    
        row.parentNode.insertBefore(row, previousRow);
    } else if (type === 'down' && nextRow) {
        const nextIndex = Number(nextRow.dataset.index);
        const nextCharacter = characters.find(char => char.id === nextIndex);
        
        const currentPosition = character.position;
        character.position = nextCharacter.position;
        nextCharacter.position = currentPosition;
    
        row.parentNode.insertBefore(nextRow, row);
    }
    saveState();
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
        deleteElementFromDB(character.id, 'character');
    }
}

function loadCellState() {
    const savedCells = JSON.parse(localStorage.getItem('cells'));
    
    if (savedCells) {
        savedCells.sort((a, b) => a.position - b.position);
        const filteredCells = savedCells.filter(cell => cell.pageId === currentPageId);
       
        filteredCells.forEach(cell => {
            const template = document.getElementById('info-template').content.cloneNode(true);
            updateCell(template, cell);
            const cellWrapper = template.querySelector('.info-wrapper');
            const inputWrapper = cellWrapper.querySelectorAll('.cell-input-wrapper');
            inputWrapper.forEach(input => {
                input.style.display = 'none';
            });
            cellWrapper.querySelector('.info-title').style.display = 'inline';
            cellWrapper.querySelector('.value-cell').style.display = 'inline';
            document.getElementById('info-list').appendChild(template);
        });
        cells.push(...savedCells);
    }
}

function generateData() {
    const newData = {
        title: 'title ' + currentPageId,
        intro: 'intro',
        poster: 'https://via.placeholder.com/100',
        pageId: currentPageId
    };
    titles.push(newData);
    updateData(newData);
    saveState();
}

function updateData(data) {
    const title = document.getElementById('title').textContent = data.title;
    const intro = document.getElementById('intro').textContent = data.intro;
    document.getElementById('poster').src = data.poster;
}

function loadState() {
    const transaction = db.transaction(['characters', 'synopses', 'titles'], 'readonly');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');
    const dataStore = transaction.objectStore('titles');
    
    characterStore.getAll().onsuccess = function(event) {
        characters = event.target.result;
        characters.sort((a, b) => a.position - b.position);
        const filteredCharacters = characters.filter(char => char.pageId === currentPageId);
        
        filteredCharacters.forEach(character => {
            const template = document.getElementById('character-template').content.cloneNode(true);
            updateRow(template, character);
            console.log(character.name + character.position);
            const editorWrapper = template.querySelector('.character-name-controls');
            editorWrapper.style.display = 'none';
            document.getElementById('table-body').appendChild(template);
        });
    };

    synopsisStore.getAll().onsuccess = function(event) {
        synopses = event.target.result;
        synopses.forEach(element => {
            const template = element.text ? document.getElementById('Synopsis-text-template').content.cloneNode(true) : document.getElementById('synopsis-img-template').content.cloneNode(true);
            if (element.text) {
                updateText(template, element);
                const synopsisWrapper = template.querySelector('.synopsis-wrapper');
                synopsisWrapper.querySelector('.synopsis-text').style.display = 'block';
                synopsisWrapper.querySelector('.synopsis-text-input').style.display = 'none';
                document.getElementById('table1').appendChild(template);
            } else if (element.imgSrc) {
                updateImage(template, element);
                document.getElementById('table1').appendChild(template);
            }
        });
    };
    
    dataStore.getAll().onsuccess = function(event) {
        titles = event.target.result;
        foundedData = titles.find(data => data.pageId === currentPageId);
        if (!titles.some(data => data.pageId === currentPageId)) {
            generateData();
        } else {
            console.log(foundedData);
            console.log(foundedData.title);
            console.log(foundedData.intro);
            console.log(foundedData.pageId)
            updateData(foundedData);
        }
        
    };
}

function saveState() {
    localStorage.setItem('intro', document.getElementById('intro').textContent);
    localStorage.setItem('cells', JSON.stringify(cells));
    const transaction = db.transaction(['characters', 'synopses', 'titles'], 'readwrite');
    const characterStore = transaction.objectStore('characters');
    const synopsisStore = transaction.objectStore('synopses');
    const dataStore = transaction.objectStore('titles');

    characters.forEach(character => characterStore.put(character));
    synopses.forEach(synopsis => synopsisStore.put(synopsis));
    titles.forEach(data => dataStore.put(data));

    transaction.oncomplete = function() {
        console.log('Data saved to IndexedDB');
    };
}

function clearSavedState() {
    if (confirm('Are you sure you want to delete the saved file?')) {
        localStorage.removeItem('cells');
        const transaction = db.transaction(['characters', 'synopses', 'titles'], 'readwrite');
        const characterStore = transaction.objectStore('characters');
        const synopsisStore = transaction.objectStore('synopses');
        const dataStore = transaction.objectStore('titles');

        characterStore.clear();
        synopsisStore.clear();
        dataStore.clear();
        

        transaction.oncomplete = function() {
            console.log('Data cleared from IndexedDB');
            location.reload();
        };

        transaction.onerror = function(event) {
            console.error('IndexedDB transaction error:', event.target.error);
        };
    }
}