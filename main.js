const dbName = 'gameData';
const dbVersion = 3;

let db;

function openDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains('pages')) {
            const pageStore = db.createObjectStore('pages', { keyPath: 'pageId' });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadState();
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };
}

let pages = [];
let sections = [];
let titles = []
let characters = [];
let synopses = [];
let cells = [];
let deletePageId;
let pageData;

document.addEventListener('DOMContentLoaded', () => {
    openDB();
    const urlParams = new URLSearchParams(window.location.search);
    deletePageId = Number(urlParams.get('pageId'));
    
    if (deletePageId) {
      const wrapper = document.querySelector(`.section-wrapper[data-index='${deletePageId}']`).querySelector('.delete-section-btn');
      setTimeout(() => {
        wrapper.click();
      }, 100);
    }
    document.getElementById('create-section-btn').addEventListener('click', generateSection);
    document.getElementById('page-list').addEventListener('click', handleSectionClick);
});

function generateSection() {
    const template = document.getElementById('section-template').content.cloneNode(true);
    const newId = sections.length + 1;
    
    const newSection = {
        id: newId,
        text: 'Page ' + newId
    };
    sections.push(newSection);
    
    updateSection(template, newSection);
    generatePage(newSection.id);
    document.getElementById('page-list').appendChild(template);
    saveState();
}

function generatePage(newId) {
    const newPage = {
        pageId: newId,
        data: {},
        characters: [],
        cells: [],
        synopses: []
    };
    pages.push(newPage);
}

function updateSection(template, section) {
    template.querySelector('.section-wrapper').setAttribute('data-index', section.id);
    template.querySelector('.title').textContent = section.text;
}

function handleSectionClick (event) {
    const target = event.target;
    const wrapper = target.closest('.section-wrapper');
    const index = wrapper.dataset.index;
    const section = sections.find(sec => sec.id == index);
    if (target.classList.contains('page-open-btn') || target.classList.contains('title')) {
        const title = wrapper.querySelector('.title').textContent;
        const sectionsParam = encodeURIComponent(JSON.stringify(sections));
        window.location.href = `page.html?pageId=${index}&pageTitle=${encodeURIComponent(title)}`;
    } else if (target.classList.contains('edit-section-btn')) {
        editSection(section, wrapper, target);
    } else if (target.classList.contains('delete-section-btn')) {
        deleteSection(wrapper, section);
    }
}

function editSection(section, element, target) {
    const editMode = target.textContent === '✏️';
    const title = element.querySelector('.title');
    const titleInput = element.querySelector('.title-input');
    
    if (editMode) {
        title.style.display = 'none';
        titleInput.style.display = 'inline';
        titleInput.value = title.textContent;
        target.textContent = '✔️';
    } else {
        titleInput.style.display = 'none';
        title.style.display = 'block';
        section.text = titleInput.value;
        title.textContent = section.text;
        target.textContent = '✏️';
    }
    saveState();
}

function deleteSection(wrapper, section) {
    const transaction = db.transaction(['pages'], 'readwrite');
    
    const pageStore = transaction.objectStore('pages');
    
    pageStore.get(section.id).onsuccess = function(event) {
        const pageData = event.target.result;
        
        if (pages) {
            wrapper.remove();
            sections.splice(sections.indexOf(section), 1);
            pageStore.delete(pageData.pageId);
            
            saveState();
        } else {
            if (confirm('Are you sure you want to delete this page?')) {
                wrapper.remove();
                pageStore.delete(pageData.pageId);
                sections.splice(sections.indexOf(section), 1);
                saveState();
                const pageData = pages.find(page => pages === deletePageId)
                
                saveState();
            }
        }
    };
    
    let previousId = 0;
    
    sections.forEach(section => {
        section.id = previousId + 1;
        previousId = section.id;
    });
}

function loadState() {
    const savedSections = JSON.parse(localStorage.getItem('sections'));
    const transaction = db.transaction(['pages'], 'readonly');
    const pageStore = transaction.objectStore('pages');
    
    if (savedSections) {
        savedSections.forEach(section => {
            const template = document.getElementById('section-template').content.cloneNode(true);
            updateSection(template, section)
            document.getElementById('page-list').appendChild(template);
        });
        sections.push(...savedSections);
    }
    
    pageStore.getAll().onsuccess = function(event) {
        pages = event.target.result;
        titles = pages.titles;
    };
}

function saveState() {
    localStorage.setItem('sections', JSON.stringify(sections));
    const transaction = db.transaction(['pages'], 'readwrite');
    
    const pageStore = transaction.objectStore('pages');
    
    pages.forEach(page => pageStore.put(page));
}