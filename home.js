let sections = [];

document.addEventListener('DOMContentLoaded', () => {
    loadState();
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
    
    updateSection(template, newSection)
    document.getElementById('page-list').appendChild(template);
    saveState();
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
        window.location.href = `page.html?pageId=${index}`;
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

function loadState() {
    const savedSections = JSON.parse(localStorage.getItem('sections'));
    
    if (savedSections) {
        savedSections.forEach(section => {
            const template = document.getElementById('section-template').content.cloneNode(true);
            updateSection(template, section)
            document.getElementById('page-list').appendChild(template);
        });
        sections.push(...savedSections);
    }
}

function deleteSection(wrapper, section) {
    wrapper.remove();
    sections.splice(sections.indexOf(section), 1);
    saveState();
}

function saveState() {
    localStorage.setItem('sections', JSON.stringify(sections));
}