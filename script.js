// --- CONFIGURACIÓN DE ESTADÍSTICAS ---
const stats = [
    { id: 'strength', name: 'Strength', color: '#ff4500', type: 'stat' },
    { id: 'dexterity', name: 'Dexterity', color: '#ffcc00', type: 'stat' },
    { id: 'mechanics', name: 'Mechanics', color: '#00ffff', type: 'stat' },
    { id: 'tech', name: 'Tech', color: '#00ff37', type: 'stat' },
    { id: 'meds', name: 'Meds', color: '#ff2a2a', type: 'stat' },
    { id: 'spotting', name: 'Spotting', color: '#00ff7f', type: 'stat' },
    { id: 'charisma', name: 'Charisma', color: '#ff00ff', type: 'stat' },
    { id: 'paracausal', name: 'Paracausal', color: '#ff00aa', type: 'stat' },
    { id: 'miscellaneous', name: 'Miscellaneous', color: '#967bb6', type: 'stat' }
];

const container = document.getElementById('stats-container');

const statCycle = ['empty', 'stamina', 'fatigue'];
const statCombatCycle = ['stamina', 'fatigue'];
const healthCycle = ['empty', 'health', 'fatigue'];
const healthCombatCycle = ['health', 'fatigue'];
const shieldCycle = ['empty', 'shield', 'fatigue'];
const shieldCombatCycle = ['shield', 'fatigue'];

const vitalsHtml = `
    <section class="col vitals-field">
        <section class="vital-row">
            <header class="label-container">
                <span class="label" style="color: var(--pip-health); font-weight:bold;">HEALTH</span>
                <span style="width: 65px;"></span>
            </header>
            <section class="pips-container health-pips">
                ${Array(12).fill('<i class="pip" data-state="empty" data-type="health" data-color="var(--pip-health)"></i>').join('')}
            </section>
        </section>
        <section class="vital-row">
            <header class="label-container">
                <span class="label" style="color: #00bfff; font-weight:bold;">SHIELD</span>
                <span style="width: 65px;"></span>
            </header>
            <section class="pips-container health-pips">
                ${Array(12).fill('<i class="pip" data-state="empty" data-type="shield" data-color="#00bfff"></i>').join('')}
            </section>
        </section>
    </section>
`;
container.innerHTML += vitalsHtml;

stats.forEach(attr => {
    const row = document.createElement('section');
    row.className = 'row';
    const labelHtml = `<header class="label-container"><span class="label" style="color: ${attr.color}">${attr.name}</span>
                 <input type="number" class="attr-value stat-dice" value="0" min="0" max="12" step="2" style="border-color:${attr.color}; color:${attr.color}"></header>`;

    let pipsHtml = '<section class="pips-container">';
    for (let i = 0; i < 10; i++) {
        pipsHtml += `<i class="pip" data-state="empty" data-type="${attr.type}" data-color="${attr.color}" style="color:${attr.color}"></i>`;
    }
    pipsHtml += '</section>';

    row.innerHTML = `${labelHtml}${pipsHtml}`;
    container.appendChild(row);
});

function updatePipVisuals(pip, state, baseColor) {
    if (state === 'empty') {
        pip.style.backgroundColor = 'var(--pip-empty)';
        pip.style.borderColor = 'rgba(255,255,255,0.2)';
    } else if (state === 'stamina') {
        pip.style.backgroundColor = baseColor;
        pip.style.borderColor = baseColor;
    } else if (state === 'fatigue') {
        pip.style.backgroundColor = 'var(--pip-fatigue)';
        pip.style.borderColor = 'var(--pip-fatigue)';
    } else if (state === 'null') {
        pip.style.backgroundColor = 'var(--pip-null)';
        pip.style.borderColor = '#000';
    } else if (state === 'health') {
        pip.style.backgroundColor = 'var(--pip-health)';
        pip.style.borderColor = 'var(--pip-health)';
    } else if (state === 'shield') {
        pip.style.backgroundColor = '#00bfff';
        pip.style.borderColor = '#00bfff';
    }
}

let isCapacityLocked = false;

document.querySelectorAll('.pip').forEach(pip => {
    pip.addEventListener('click', function () {
        const type = this.getAttribute('data-type');
        const baseColor = this.getAttribute('data-color');
        let currentState = this.getAttribute('data-state');

        let activeCycle, activeCombatCycle;
        if (type === 'health') {
            activeCycle = healthCycle; activeCombatCycle = healthCombatCycle;
        } else if (type === 'shield') {
            activeCycle = shieldCycle; activeCombatCycle = shieldCombatCycle;
        } else {
            activeCycle = statCycle; activeCombatCycle = statCombatCycle;
        }

        if (isCapacityLocked) {
            if (this.getAttribute('data-enabled') !== 'true') return;
            let nextIndex = (activeCombatCycle.indexOf(currentState) + 1) % activeCombatCycle.length;
            if (nextIndex === 0 && activeCombatCycle.indexOf(currentState) === -1) nextIndex = 1;

            let nextState = activeCombatCycle[nextIndex];
            this.setAttribute('data-state', nextState);
            updatePipVisuals(this, nextState, baseColor);
        } else {
            let nextIndex = (activeCycle.indexOf(currentState) + 1) % activeCycle.length;
            let nextState = activeCycle[nextIndex];
            this.setAttribute('data-state', nextState);
            updatePipVisuals(this, nextState, baseColor);
        }
        saveBoardState();
    });
});

const allowedDice = [0, 2, 4, 6, 8, 12];
document.querySelectorAll('.stat-dice').forEach(input => {
    input.addEventListener('blur', function () {
        let val = parseInt(this.value);
        if (isNaN(val)) val = 0;
        let closest = allowedDice.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
        this.value = closest;
        saveBoardState();
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') this.blur();
    });
});

// --- VARIABLES ---
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const closeSettings = document.getElementById('close-settings');

const lockIconContainer = document.getElementById('lock-icon-container');
const lockIconSvg = document.getElementById('lock-icon-svg');
const pilotNameInput = document.getElementById('pilot-name');
const mechClassInput = document.getElementById('mech-class');

const allGritInputs = document.querySelectorAll('.grit-input');
const allGritLabels = document.querySelectorAll('.grit-label');
const levelInput = document.getElementById('level-value');
const gritInput = document.getElementById('grit-value');
const evasionInput = document.getElementById('evasion-value');

const unlockNameBtn = document.getElementById('unlock-name-btn');

const pipsLockContainer = document.getElementById('pips-lock-container');
const pipsLockSvg = document.getElementById('pips-lock-svg');
const unlockPipsBtn = document.getElementById('unlock-pips-btn');
const restBtn = document.getElementById('rest-btn');

const inventoryCard = document.getElementById('inventory-card');
const inventoryToggle = document.getElementById('inventory-toggle');
const inventoryBody = document.getElementById('inventory-body');
const addItemBtn = document.getElementById('add-item-btn');
const inventoryList = document.getElementById('inventory-list');
const pilotNotes = document.getElementById('pilot-notes');
const creditsInput = document.getElementById('credits-input');

// VARIABLES COMP/CON
const compconCard = document.getElementById('compcon-card');
const compconToggle = document.getElementById('compcon-toggle');
const compconBody = document.getElementById('compcon-body');
const compconFrame = document.getElementById('compcon-frame'); 
const compconSettingsBtn = document.getElementById('compcon-settings-btn');
const compconSettingsMenu = document.getElementById('compcon-settings-menu');
const shapeBtns = document.querySelectorAll('.shape-btn');

const svgPathUnlocked = '<path d="M7 11V7a5 5 0 0 1 9.9-1"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>';
const svgPathLocked = '<path d="M17 11V7a5 5 0 0 0-10 0v4"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>';

settingsToggle.addEventListener('click', () => settingsPanel.classList.add('open'));
closeSettings.addEventListener('click', () => settingsPanel.classList.remove('open'));

pilotNameInput.addEventListener('input', saveBoardState);
mechClassInput.addEventListener('input', saveBoardState);
levelInput.addEventListener('input', saveBoardState);
gritInput.addEventListener('input', saveBoardState);
evasionInput.addEventListener('input', saveBoardState);
pilotNotes.addEventListener('input', saveBoardState);
creditsInput.addEventListener('input', saveBoardState);


// --- LÓGICA DE APERTURA DE TABLEROS Y FORMAS ---

// Inventario (Superior)
inventoryCard.addEventListener('click', () => {
    if (window.innerWidth >= 1100 && inventoryCard.classList.contains('collapsed-card')) {
        inventoryCard.classList.remove('collapsed-card');
        saveBoardState();
    }
});
inventoryToggle.addEventListener('click', (e) => {
    if (window.innerWidth >= 1100) {
        if (inventoryCard.classList.contains('collapsed-card')) { inventoryCard.classList.remove('collapsed-card'); }
        else { inventoryCard.classList.add('collapsed-card'); }
        saveBoardState();
        e.stopPropagation();
    }
    else {
        inventoryBody.classList.toggle('collapsed');
        inventoryToggle.classList.toggle('collapsed-header');
        saveBoardState();
    }
});


// COMP/CON - Lógica del Engranaje de Forma
compconSettingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita que se abra/cierre el tablero entero al tocar la tuerquita
    compconSettingsMenu.classList.toggle('hidden');
});

// Evitar que hacer clic adentro del menú cierre la ventana de compcon
compconSettingsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// COMP/CON - Aplicar Forma (Horizontal, Cuadrado, Vertical)
shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const shape = btn.getAttribute('data-shape');
        
        // Sacamos todas las formas previas y ponemos la nueva
        compconCard.classList.remove('shape-horizontal', 'shape-square', 'shape-vertical');
        compconCard.classList.add(`shape-${shape}`);
        
        // Pintamos el botón activo
        shapeBtns.forEach(b => b.classList.remove('active-shape'));
        btn.classList.add('active-shape');
        
        // Ocultamos el menú (opcional para UX limpia)
        compconSettingsMenu.classList.add('hidden');
        
        saveBoardState();
    });
});

// COMP/CON - Botón Principal (Abre y Cierra la terminal)
function loadCompConSafely() {
    if (!compconFrame.getAttribute('src')) {
        const currentScrollY = window.scrollY;
        const currentScrollX = window.scrollX;
        const lockCamera = () => window.scrollTo(currentScrollX, currentScrollY);
        
        window.addEventListener('scroll', lockCamera);
        compconFrame.setAttribute('src', 'https://compcon.app/#/pilot_management');
        
        setTimeout(() => {
            window.removeEventListener('scroll', lockCamera);
        }, 5000);
    }
}

// COMP/CON - Botón Principal (Abre y Cierra la terminal)
compconToggle.addEventListener('click', () => {
    if (!compconFrame.getAttribute('src')) {
        // Carga directa y limpia a la URL que elegiste
        compconFrame.setAttribute('src', 'https://compcon.app/#/pilot_management');
    }
    
    compconBody.classList.toggle('collapsed');
    compconToggle.classList.toggle('collapsed-header');
    compconSettingsMenu.classList.add('hidden'); 
    saveBoardState();
});


function createInventoryItem(value = "") {
    const itemDiv = document.createElement('article');
    itemDiv.className = 'inventory-item';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inv-input';
    input.value = value;
    input.placeholder = "ITEM // QTY // DESC";
    input.addEventListener('blur', saveBoardState);

    const delBtn = document.createElement('button');
    delBtn.className = 'inv-del-btn';
    delBtn.textContent = 'X';
    delBtn.title = 'Eliminar Item';
    delBtn.addEventListener('click', () => {
        itemDiv.remove();
        saveBoardState();
    });

    itemDiv.appendChild(input);
    itemDiv.appendChild(delBtn);
    inventoryList.appendChild(itemDiv);
}

addItemBtn.addEventListener('click', () => {
    createInventoryItem();
    saveBoardState();
});

// --- BLOQUEOS REDISEÑADOS COMO INTERRUPTORES (TOGGLES) ---
lockIconContainer.addEventListener('click', () => {
    const isCurrentlyLocked = lockIconContainer.classList.contains('locked-state');
    
    if (!isCurrentlyLocked) { 
        pilotNameInput.readOnly = true;
        mechClassInput.readOnly = true;
        allGritInputs.forEach(input => input.readOnly = true);

        pilotNameInput.classList.add('locked');
        mechClassInput.classList.add('locked');

        allGritInputs.forEach(input => input.classList.add('locked'));
        allGritLabels.forEach(label => label.classList.add('locked'));

        lockIconSvg.innerHTML = svgPathLocked;
        lockIconContainer.classList.add('locked-state');
        lockIconContainer.title = 'Identificación Bloqueada (Clic para Desbloquear)';
    } else { 
        pilotNameInput.readOnly = false;
        mechClassInput.readOnly = false;
        allGritInputs.forEach(input => input.readOnly = false);

        pilotNameInput.classList.remove('locked');
        mechClassInput.classList.remove('locked');

        allGritInputs.forEach(input => input.classList.remove('locked'));
        allGritLabels.forEach(label => label.classList.remove('locked'));

        lockIconSvg.innerHTML = svgPathUnlocked;
        lockIconContainer.classList.remove('locked-state');
        lockIconContainer.title = 'Bloquear Identificación';
    }
    saveBoardState();
});

pipsLockContainer.addEventListener('click', () => {
    isCapacityLocked = !isCapacityLocked; 
    
    if (isCapacityLocked) { 
        pipsLockSvg.innerHTML = svgPathLocked;
        pipsLockContainer.classList.add('locked-state');
        pipsLockContainer.title = 'Capacidad Bloqueada (Clic para Desbloquear)';

        document.querySelectorAll('.pip').forEach(pip => {
            const state = pip.getAttribute('data-state');
            if (state === 'stamina' || state === 'fatigue' || state === 'health' || state === 'shield') {
                pip.setAttribute('data-enabled', 'true');
            } else {
                pip.setAttribute('data-enabled', 'false');
                pip.classList.add('disabled-pip');
            }
        });
    } else { 
        pipsLockSvg.innerHTML = svgPathUnlocked;
        pipsLockContainer.classList.remove('locked-state');
        pipsLockContainer.title = 'Fijar Capacidad (Bloquear Edición)';

        document.querySelectorAll('.pip').forEach(pip => {
            pip.removeAttribute('data-enabled');
            pip.classList.remove('disabled-pip');
        });
    }
    saveBoardState();
});

// Botones del menú
unlockNameBtn.addEventListener('click', () => {
    if (lockIconContainer.classList.contains('locked-state')) lockIconContainer.click();
    settingsPanel.classList.remove('open');
});

unlockPipsBtn.addEventListener('click', () => {
    if (isCapacityLocked) pipsLockContainer.click();
    settingsPanel.classList.remove('open');
});


restBtn.addEventListener('click', () => {
    document.querySelectorAll('.pip').forEach(pip => {
        const type = pip.getAttribute('data-type');
        const baseColor = pip.getAttribute('data-color');

        let targetState = 'stamina';
        if (type === 'health') targetState = 'health';
        if (type === 'shield') targetState = 'shield';

        if (isCapacityLocked) {
            if (pip.getAttribute('data-enabled') === 'true') {
                pip.setAttribute('data-state', targetState);
                updatePipVisuals(pip, targetState, baseColor);
            }
        } else {
            const state = pip.getAttribute('data-state');
            if (state === 'fatigue' || (type === 'health' && state !== 'empty' && state !== 'null') || (type === 'shield' && state !== 'empty' && state !== 'null')) {
                pip.setAttribute('data-state', targetState);
                updatePipVisuals(pip, targetState, baseColor);
            }
        }
    });
    saveBoardState();
});

const themeSelector = document.getElementById('theme-selector');
stats.forEach(attr => {
    if (attr.type === 'stat') {
        const option = document.createElement('option');
        option.value = attr.color;
        option.textContent = `Tema: ${attr.name}`;
        themeSelector.appendChild(option);
    }
});

themeSelector.addEventListener('change', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--border-primary', color);
    saveBoardState();
});


// --- SISTEMA DE PERSISTENCIA LOCAL ---
function saveBoardState() {
    
    // Identificar qué forma está activa actualmente
    let activeShape = 'horizontal';
    if (compconCard.classList.contains('shape-square')) activeShape = 'square';
    if (compconCard.classList.contains('shape-vertical')) activeShape = 'vertical';
    
    const state = {
        pilotName: pilotNameInput.value,
        mechClass: mechClassInput.value,
        levelValue: levelInput.value,
        gritValue: gritInput.value,
        evasionValue: evasionInput.value,
        isNameLocked: pilotNameInput.readOnly,
        isCapacityLocked: isCapacityLocked,
        themeColor: document.documentElement.style.getPropertyValue('--border-primary') || '#00ffff',
        notes: pilotNotes.value,
        credits: creditsInput.value,

        inventory: Array.from(document.querySelectorAll('.inventory-item .inv-input'))
            .map(inp => inp.value)
            .filter(val => val.trim() !== ''),

        isInventoryOpen: !inventoryCard.classList.contains('collapsed-card') && !inventoryBody.classList.contains('collapsed'),

        isCompconOpen: !compconBody.classList.contains('collapsed'),
        compconShape: activeShape, // GUARDAR LA FORMA ELEGIDA

        statValues: Array.from(document.querySelectorAll('.stat-dice')).map(input => input.value),
        pips: Array.from(document.querySelectorAll('.pip')).map(pip => ({
            state: pip.getAttribute('data-state'),
            enabled: pip.getAttribute('data-enabled')
        }))
    };
    localStorage.setItem('lancerBoardState', JSON.stringify(state));
}

function loadBoardState() {
    const savedData = localStorage.getItem('lancerBoardState');
    if (!savedData) {
        createInventoryItem();
        return;
    }

    const state = JSON.parse(savedData);

    if (state.themeColor) {
        document.documentElement.style.setProperty('--border-primary', state.themeColor);
        themeSelector.value = state.themeColor;
    }

    pilotNameInput.value = state.pilotName || '';
    mechClassInput.value = state.mechClass || '';
    if (state.levelValue !== undefined) levelInput.value = state.levelValue;
    if (state.gritValue !== undefined) gritInput.value = state.gritValue;
    if (state.evasionValue !== undefined) evasionInput.value = state.evasionValue;
    if (state.notes !== undefined) pilotNotes.value = state.notes;
    if (state.credits !== undefined) creditsInput.value = state.credits;

    inventoryList.innerHTML = '';
    if (state.inventory && state.inventory.length > 0) {
        const validItems = state.inventory.filter(val => val.trim() !== '');
        if (validItems.length > 0) {
            validItems.forEach(val => createInventoryItem(val));
        } else {
            createInventoryItem();
        }
    } else {
        createInventoryItem();
    }

    if (state.isInventoryOpen === false) {
        if (window.innerWidth >= 1100) { inventoryCard.classList.add('collapsed-card'); }
        else { inventoryBody.classList.add('collapsed'); inventoryToggle.classList.add('collapsed-header'); }
    }

    // CARGAR ESTADO Y FORMA DE COMP/CON
    if (state.compconShape) {
        compconCard.classList.remove('shape-horizontal', 'shape-square', 'shape-vertical');
        compconCard.classList.add(`shape-${state.compconShape}`);
        
        shapeBtns.forEach(b => {
            if(b.getAttribute('data-shape') === state.compconShape) {
                b.classList.add('active-shape');
            } else {
                b.classList.remove('active-shape');
            }
        });
    }
    
    if (state.isCompconOpen === true) {
        // Inyecta el iframe directamente sin anclas que traben la pantalla
        compconFrame.setAttribute('src', 'https://compcon.app/#/pilot_management');
        compconBody.classList.remove('collapsed');
        compconToggle.classList.remove('collapsed-header');
    }

    const statInputs = document.querySelectorAll('.stat-dice');
    if (state.statValues) {
        state.statValues.forEach((val, i) => {
            if (statInputs[i]) statInputs[i].value = val;
        });
    }

    const allPips = document.querySelectorAll('.pip');
    if (state.pips) {
        state.pips.forEach((savedPip, i) => {
            if (allPips[i]) {
                const baseColor = allPips[i].getAttribute('data-color');
                allPips[i].setAttribute('data-state', savedPip.state);
                if (savedPip.enabled) allPips[i].setAttribute('data-enabled', savedPip.enabled);
                updatePipVisuals(allPips[i], savedPip.state, baseColor);
            }
        });
    }

    if (state.isNameLocked) {
        pilotNameInput.readOnly = true;
        mechClassInput.readOnly = true;
        pilotNameInput.classList.add('locked');
        mechClassInput.classList.add('locked');

        allGritInputs.forEach(input => {
            input.readOnly = true;
            input.classList.add('locked');
        });
        allGritLabels.forEach(label => label.classList.add('locked'));

        lockIconSvg.innerHTML = svgPathLocked;
        lockIconContainer.classList.add('locked-state');
        lockIconContainer.title = 'Identificación Bloqueada (Clic para Desbloquear)';
    }

    if (state.isCapacityLocked) {
        isCapacityLocked = true;
        pipsLockSvg.innerHTML = svgPathLocked;
        pipsLockContainer.classList.add('locked-state');
        pipsLockContainer.title = 'Capacidad Bloqueada (Clic para Desbloquear)';

        allPips.forEach(pip => {
            if (pip.getAttribute('data-enabled') !== 'true') {
                pip.classList.add('disabled-pip');
            }
        });
    }
}

function initializeBoardColors() {
    document.querySelectorAll('.pip').forEach(pip => {
        updatePipVisuals(pip, pip.getAttribute('data-state'), pip.getAttribute('data-color'));
    });
}

// --- LÓGICA DE FONDOS CON INDEXEDDB ---
const dbName = "LancerTrackerDB";
const storeName = "images";
let db;
const request = indexedDB.open(dbName, 1);
request.onerror = (event) => console.error("Error DB:", event);
request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore(storeName, { keyPath: "name" });
};
request.onsuccess = (event) => {
    db = event.target.result;
    populateImageSelector();
    loadActiveBackgrounds();
};

const fileInput = document.getElementById('image-upload');
fileInput.addEventListener('change', handleImageUpload);
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const imageName = prompt("Nombre de la imagen:", file.name) || file.name;
    const reader = new FileReader();
    reader.onload = function (e) { saveImageToDB(imageName, e.target.result); };
    reader.readAsDataURL(file);
}
function saveImageToDB(name, data) {
    const transaction = db.transaction([storeName], "readwrite");
    transaction.objectStore(storeName).put({ name: name, data: data });
    transaction.oncomplete = () => { populateImageSelector(); fileInput.value = ''; };
}
function populateImageSelector() {
    const selector = document.getElementById('image-selector');
    selector.innerHTML = '<option value="">-- Seleccionar Imagen --</option>';
    db.transaction([storeName], "readonly").objectStore(storeName).openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const option = document.createElement('option');
            option.value = option.textContent = cursor.value.name;
            selector.appendChild(option);
            cursor.continue();
        }
    };
}
function applyImage(target) {
    const imageName = document.getElementById('image-selector').value;
    if (!imageName) return;
    db.transaction([storeName], "readonly").objectStore(storeName).get(imageName).onsuccess = (e) => {
        const cssUrl = `url(${e.target.result.data})`;
        if (target === 'page') { document.body.style.backgroundImage = cssUrl; localStorage.setItem('activePageBG', imageName); }
        else { document.getElementById('main-card').style.backgroundImage = cssUrl; localStorage.setItem('activeCardBG', imageName); }
    };
}
function loadActiveBackgrounds() {
    const activePageBG = localStorage.getItem('activePageBG');
    const activeCardBG = localStorage.getItem('activeCardBG');
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    if (activePageBG) store.get(activePageBG).onsuccess = (e) => { if (e.target.result) document.body.style.backgroundImage = `url(${e.target.result.data})`; };
    if (activeCardBG) store.get(activeCardBG).onsuccess = (e) => { if (e.target.result) document.getElementById('main-card').style.backgroundImage = `url(${e.target.result.data})`; };
}
function deleteSelectedImage() {
    const selector = document.getElementById('image-selector');
    const imageName = selector.value;
    if (!imageName || !confirm(`¿Eliminar ${imageName}?`)) return;
    db.transaction([storeName], "readwrite").objectStore(storeName).delete(imageName).oncomplete = () => {
        populateImageSelector();
        if (localStorage.getItem('activePageBG') === imageName) { document.body.style.backgroundImage = ''; localStorage.removeItem('activePageBG'); }
        if (localStorage.getItem('activeCardBG') === imageName) { document.getElementById('main-card').style.backgroundImage = ''; localStorage.removeItem('activeCardBG'); }
    };
}
function resetBackgrounds() {
    document.body.style.backgroundImage = '';
    document.getElementById('main-card').style.backgroundImage = '';
    localStorage.removeItem('activePageBG');
    localStorage.removeItem('activeCardBG');
}

// --- LÓGICA DEL BOTÓN FACTORY RESET ---
const hardResetBtn = document.getElementById('hard-reset-btn');
const resetModal = document.getElementById('reset-modal');
const confirmResetBtn = document.getElementById('confirm-reset-btn');
const cancelResetBtn = document.getElementById('cancel-reset-btn');
let resetInterval;

hardResetBtn.addEventListener('click', () => {
    resetModal.classList.add('active');
    confirmResetBtn.disabled = true;
    settingsPanel.classList.remove('open');

    let timeLeft = 3;
    confirmResetBtn.textContent = `CONFIRMAR (${timeLeft})`;

    resetInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            confirmResetBtn.textContent = `CONFIRMAR (${timeLeft})`;
        } else {
            clearInterval(resetInterval);
            confirmResetBtn.textContent = 'CONFIRMAR BORRADO';
            confirmResetBtn.disabled = false;
        }
    }, 1000);
});

cancelResetBtn.addEventListener('click', () => {
    resetModal.classList.remove('active');
    clearInterval(resetInterval);
});

confirmResetBtn.addEventListener('click', () => {
    localStorage.clear();
    if (db) { db.close(); }
    const req = indexedDB.deleteDatabase("LancerTrackerDB");

    req.onsuccess = function () { window.location.reload(); };
    req.onerror = function () { window.location.reload(); };
    req.onblocked = function () { window.location.reload(); };
});

// Inicialización
initializeBoardColors();
loadBoardState();