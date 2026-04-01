// --- CONFIGURACIÓN DE ESTADÍSTICAS ---
const stats = [
    { id: 'strength', name: 'Strength', color: '#ff4500', type: 'stat' },
    { id: 'dexterity', name: 'Dexterity', color: '#ffcc00', type: 'stat' },
    { id: 'mechanics', name: 'Mechanics', color: '#00ffff', type: 'stat' },
    { id: 'tech', name: 'Tech', color: '#00ff37', type: 'stat' },
    { id: 'meds', name: 'Meds', color: '#ff2a2a', type: 'stat' },
    { id: 'spotting', name: 'Spotting', color: '#0400ff', type: 'stat' },
    { id: 'charisma', name: 'Charisma', color: '#ff00ff', type: 'stat' },
    { id: 'paracausal', name: 'Paracausal', color: '#ff00aa', type: 'stat' },
    { id: 'misc', name: 'Misc', color: '#864bad', type: 'stat' }
];

const container = document.getElementById('stats-container');

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

// --- LÓGICA DE BARRAS INTELIGENTES (PIPS) ---
document.querySelectorAll('.pip').forEach(pip => {
    pip.addEventListener('click', function () {
        const container = this.parentElement;
        const allPips = Array.from(container.querySelectorAll('.pip'));
        const type = this.getAttribute('data-type');
        const currentState = this.getAttribute('data-state');

        let filledState = 'stamina';
        if (type === 'health') filledState = 'health';
        if (type === 'shield') filledState = 'shield';

        if (!isCapacityLocked) {
            const clickedIndex = allPips.indexOf(this);
            let newFillLevel = clickedIndex;

            if (currentState === filledState) {
                if (clickedIndex === allPips.length - 1 || allPips[clickedIndex + 1].getAttribute('data-state') !== filledState) {
                    newFillLevel = clickedIndex - 1;
                }
            }

            allPips.forEach((p, i) => {
                const nextState = i <= newFillLevel ? filledState : 'empty';
                p.setAttribute('data-state', nextState);
                updatePipVisuals(p, nextState, p.getAttribute('data-color'));
            });

        } else {
            if (this.getAttribute('data-enabled') !== 'true') return;
            
            const enabledPips = allPips.filter(p => p.getAttribute('data-enabled') === 'true');
            const clickedIndex = enabledPips.indexOf(this);
            
            const newFillLevel = (currentState === filledState) ? clickedIndex - 1 : clickedIndex;

            enabledPips.forEach((p, i) => {
                const nextState = i <= newFillLevel ? filledState : 'fatigue';
                p.setAttribute('data-state', nextState);
                updatePipVisuals(p, nextState, p.getAttribute('data-color'));
            });
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
const appContainer = document.getElementById('app-container');
const topBoardsContainer = document.querySelector('.top-boards-container');

const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const closeSettings = document.getElementById('close-settings');

const lockIconContainer = document.getElementById('lock-icon-container');
const lockIconSvg = document.getElementById('lock-icon-svg');
const pilotNameInput = document.getElementById('pilot-name');
const mechClassInput = document.getElementById('mech-class');

// Avatar Vars
const avatarContainer = document.getElementById('avatar-container');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPlaceholder = document.getElementById('avatar-placeholder');
const avatarDropdown = document.getElementById('avatar-dropdown'); 
const avatarToggleBtn = document.getElementById('avatar-toggle-btn');

// --- LÓGICA DEL BOTÓN DE AVATAR (MÓVILES) ---
avatarToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    avatarDropdown.classList.toggle('active-dropdown');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 600 && avatarDropdown.classList.contains('active-dropdown')) {
        if (!avatarDropdown.contains(e.target) && e.target !== avatarToggleBtn) {
            avatarDropdown.classList.remove('active-dropdown');
        }
    }
});

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

// Inventory Modal Vars
const expandedInvModal = document.getElementById('expanded-inv-modal');
const closeExpandedInvBtn = document.getElementById('close-expanded-inv');
const globalExpandInvBtn = document.getElementById('global-expand-inv-btn');
const expandedInvList = document.getElementById('expanded-inv-list');
const addExpItemBtn = document.getElementById('add-exp-item-btn');

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

// --- LÓGICA DEL AVATAR ---
avatarContainer.addEventListener('click', () => avatarUpload.click());

avatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        avatarContainer.style.backgroundImage = `url(${evt.target.result})`;
        avatarPlaceholder.style.display = 'none';
        saveBoardState();
    };
    reader.readAsDataURL(file);
});


// --- LÓGICA DE APERTURA DE TABLEROS Y FORMAS (CORREGIDA) ---
inventoryToggle.addEventListener('click', (e) => {
    // Si el clic NO fue en un botón/input (como el expandir general), entonces minimiza/maximiza
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('button')) {
        inventoryBody.classList.toggle('collapsed');
        inventoryToggle.classList.toggle('collapsed-header');
        saveBoardState();
    }
});


compconSettingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    compconSettingsMenu.classList.toggle('hidden');
});

compconSettingsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const shape = btn.getAttribute('data-shape');
        
        compconCard.classList.remove('shape-horizontal', 'shape-square', 'shape-vertical');
        compconCard.classList.add(`shape-${shape}`);
        
        shapeBtns.forEach(b => b.classList.remove('active-shape'));
        btn.classList.add('active-shape');
        
        compconSettingsMenu.classList.add('hidden');
        handleCompConPosition();
        saveBoardState();
    });
});

function loadCompConIframe() {
    if (!compconFrame.getAttribute('src')) {
        compconFrame.setAttribute('src', 'https://compcon.app/#/pilot_management');
    }
}

compconToggle.addEventListener('click', (e) => {
    if (e.target.closest('#compcon-settings-btn')) return;
    
    loadCompConIframe();
    compconBody.classList.toggle('collapsed');
    compconToggle.classList.toggle('collapsed-header');
    compconSettingsMenu.classList.add('hidden'); 
    handleCompConPosition();
    saveBoardState();
});

// --- LÓGICA DEL INVENTARIO EXPANDIDO CON CANTIDADES Y PRECIOS ---
globalExpandInvBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    expandedInvModal.classList.add('active');
});

closeExpandedInvBtn.addEventListener('click', () => {
    expandedInvModal.classList.remove('active');
});

addExpItemBtn.addEventListener('click', () => {
    createInventoryItem();
    saveBoardState();
    setTimeout(() => expandedInvList.scrollTop = expandedInvList.scrollHeight, 50);
});

function updateItemTotalPrice(qtyInput, priceInput, totalDiv) {
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const total = qty * price;
    
    if (total === 0) {
        totalDiv.textContent = '0 CR';
    } else {
        totalDiv.textContent = (total % 1 === 0 ? total : total.toFixed(2)) + ' CR';
    }
}

function createInventoryItem(id = Date.now() + Math.random(), nameValue = "", qtyValue = "", priceValue = "", descValue = "") {
    
    // 1. CREAR VERSIÓN COMPACTA
    const compItem = document.createElement('article');
    compItem.className = 'inventory-item';
    compItem.dataset.id = id;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'inv-input inv-input-name';
    nameInput.value = nameValue;
    nameInput.placeholder = "ITEM";

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'inv-input inv-input-qty';
    qtyInput.value = qtyValue;
    qtyInput.min = "0";
    qtyInput.placeholder = "QTY";

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.className = 'inv-input inv-input-price';
    priceInput.value = priceValue;
    priceInput.min = "0";
    priceInput.step = "any"; 
    priceInput.placeholder = "PRICE";
    
    const totalPriceDiv = document.createElement('div');
    totalPriceDiv.className = 'inv-total-price';
    totalPriceDiv.textContent = "0 CR";

    const expandBtn = document.createElement('button');
    expandBtn.className = 'inv-expand-btn';
    expandBtn.innerHTML = '⛶';
    expandBtn.title = 'Abrir Detalles';

    const delBtn = document.createElement('button');
    delBtn.className = 'inv-del-btn';
    delBtn.textContent = 'X';

    compItem.appendChild(nameInput);
    compItem.appendChild(qtyInput);
    compItem.appendChild(priceInput);
    compItem.appendChild(totalPriceDiv);
    compItem.appendChild(expandBtn);
    compItem.appendChild(delBtn);
    inventoryList.appendChild(compItem);

    // 2. CREAR VERSIÓN EXPANDIDA (MODAL)
    const expItem = document.createElement('article');
    expItem.className = 'expanded-inv-item';
    expItem.dataset.id = id;

    const expHeader = document.createElement('div');
    expHeader.className = 'exp-inv-header';

    const expNameInput = document.createElement('input');
    expNameInput.type = 'text';
    expNameInput.className = 'inv-input inv-input-name';
    expNameInput.value = nameValue;
    expNameInput.placeholder = "Nombre del Item";
    
    const expQtyInput = document.createElement('input');
    expQtyInput.type = 'number';
    expQtyInput.className = 'inv-input inv-input-qty';
    expQtyInput.value = qtyValue;
    expQtyInput.min = "0";
    expQtyInput.placeholder = "QTY";

    const expPriceInput = document.createElement('input');
    expPriceInput.type = 'number';
    expPriceInput.className = 'inv-input inv-input-price';
    expPriceInput.value = priceValue;
    expPriceInput.min = "0";
    expPriceInput.step = "any";
    expPriceInput.placeholder = "PRICE";
    
    const expTotalPriceDiv = document.createElement('div');
    expTotalPriceDiv.className = 'inv-total-price';
    expTotalPriceDiv.textContent = "0 CR";
    
    const toggleDescBtn = document.createElement('button');
    toggleDescBtn.className = 'inv-expand-btn';
    toggleDescBtn.innerHTML = descValue ? '▲' : '▼'; 
    toggleDescBtn.title = "Alternar Descripción";

    const expDelBtn = document.createElement('button');
    expDelBtn.className = 'inv-del-btn';
    expDelBtn.textContent = 'X';

    expHeader.appendChild(expNameInput);
    expHeader.appendChild(expQtyInput);
    expHeader.appendChild(expPriceInput);
    expHeader.appendChild(expTotalPriceDiv);
    expHeader.appendChild(toggleDescBtn);
    expHeader.appendChild(expDelBtn);

    const descArea = document.createElement('textarea');
    descArea.className = 'lancer-textarea exp-inv-desc collapsed';
    descArea.value = descValue;
    descArea.placeholder = "Descripción del objeto, efectos, notas...";

    expItem.appendChild(expHeader);
    expItem.appendChild(descArea);
    expandedInvList.appendChild(expItem);

    // 3. EVENTOS DE SINCRONIZACIÓN Y CÁLCULO
    const syncItem = () => {
        expNameInput.value = nameInput.value;
        expQtyInput.value = qtyInput.value;
        expPriceInput.value = priceInput.value;
        updateItemTotalPrice(qtyInput, priceInput, totalPriceDiv);
        updateItemTotalPrice(expQtyInput, expPriceInput, expTotalPriceDiv);
        saveBoardState();
    };

    const syncExpItem = () => {
        nameInput.value = expNameInput.value;
        qtyInput.value = expQtyInput.value;
        priceInput.value = expPriceInput.value;
        updateItemTotalPrice(qtyInput, priceInput, totalPriceDiv);
        updateItemTotalPrice(expQtyInput, expPriceInput, expTotalPriceDiv);
        saveBoardState();
    };

    nameInput.addEventListener('input', syncItem);
    qtyInput.addEventListener('input', syncItem);
    priceInput.addEventListener('input', syncItem);

    expNameInput.addEventListener('input', syncExpItem);
    expQtyInput.addEventListener('input', syncExpItem);
    expPriceInput.addEventListener('input', syncExpItem);
    
    descArea.addEventListener('input', saveBoardState);

    updateItemTotalPrice(qtyInput, priceInput, totalPriceDiv);
    updateItemTotalPrice(expQtyInput, expPriceInput, expTotalPriceDiv);

    // 4. EVENTOS DE BORRADO (Borra en ambas vistas a la vez)
    const deleteAction = () => { compItem.remove(); expItem.remove(); saveBoardState(); };
    delBtn.addEventListener('click', deleteAction);
    expDelBtn.addEventListener('click', deleteAction);

    // 5. EVENTO ABRIR DESDE COMPACTA
    expandBtn.addEventListener('click', () => {
        expandedInvModal.classList.add('active'); 
        descArea.classList.remove('collapsed');   
        toggleDescBtn.innerHTML = '▲';
        setTimeout(() => expItem.scrollIntoView({ behavior: 'smooth', block: 'center' }), 10);
    });

    // 6. EVENTO DESPLEGAR DENTRO DEL MODAL
    toggleDescBtn.addEventListener('click', () => {
        descArea.classList.toggle('collapsed');
        toggleDescBtn.innerHTML = descArea.classList.contains('collapsed') ? '▼' : '▲';
    });
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
        }
    });
    saveBoardState();
});

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
}

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
    document.documentElement.style.setProperty('--theme-rgb', hexToRgb(color));
    
    if(!localStorage.getItem('activePageBG')) {
        document.body.style.backgroundImage = `linear-gradient(rgba(${hexToRgb(color)}, 0.05), rgba(${hexToRgb(color)}, 0.05))`;
    }
    
    saveBoardState();
});

// --- SISTEMA DE PERSISTENCIA LOCAL ---
function saveBoardState() {
    let activeShape = 'horizontal';
    if (compconCard.classList.contains('shape-square')) activeShape = 'square';
    if (compconCard.classList.contains('shape-vertical')) activeShape = 'vertical';
    
    const savedInventory = Array.from(document.querySelectorAll('.expanded-inv-item')).map(item => {
        return {
            id: item.dataset.id,
            name: item.querySelector('.inv-input-name').value,
            qty: item.querySelector('.inv-input-qty').value,
            price: item.querySelector('.inv-input-price').value,
            desc: item.querySelector('.exp-inv-desc').value
        };
    }).filter(obj => obj.name.trim() !== '' || obj.desc.trim() !== '' || obj.qty !== '' || obj.price !== '');

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
        pilotAvatar: avatarContainer.style.backgroundImage, 

        inventory: savedInventory,

        isInventoryOpen: !inventoryBody.classList.contains('collapsed'),
        isCompconOpen: !compconBody.classList.contains('collapsed'),
        compconShape: activeShape, 

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
        document.documentElement.style.setProperty('--theme-rgb', hexToRgb('#00ffff')); 
        createInventoryItem();
        return;
    }

    const state = JSON.parse(savedData);

    if (state.themeColor) {
        document.documentElement.style.setProperty('--border-primary', state.themeColor);
        document.documentElement.style.setProperty('--theme-rgb', hexToRgb(state.themeColor));
        themeSelector.value = state.themeColor;
        
        if(!localStorage.getItem('activePageBG')) {
            document.body.style.backgroundImage = `linear-gradient(rgba(${hexToRgb(state.themeColor)}, 0.05), rgba(${hexToRgb(state.themeColor)}, 0.05))`;
        }
    } else {
        document.documentElement.style.setProperty('--theme-rgb', hexToRgb('#00ffff'));
    }

    pilotNameInput.value = state.pilotName || '';
    mechClassInput.value = state.mechClass || '';
    if (state.levelValue !== undefined) levelInput.value = state.levelValue;
    if (state.gritValue !== undefined) gritInput.value = state.gritValue;
    if (state.evasionValue !== undefined) evasionInput.value = state.evasionValue;
    if (state.notes !== undefined) pilotNotes.value = state.notes;
    if (state.credits !== undefined) creditsInput.value = state.credits;

    if (state.pilotAvatar && state.pilotAvatar !== 'none') {
        avatarContainer.style.backgroundImage = state.pilotAvatar;
        avatarPlaceholder.style.display = 'none';
    }

    inventoryList.innerHTML = '';
    expandedInvList.innerHTML = ''; 
    if (state.inventory && state.inventory.length > 0) {
        state.inventory.forEach(val => {
            if (typeof val === 'string') {
                if (val.trim() !== '') createInventoryItem(Date.now() + Math.random(), val, "", "", "");
            } else if (val.price !== undefined) {
                 createInventoryItem(val.id, val.name, val.qty, val.price, val.desc);
            } else {
                createInventoryItem(val.id, val.name, "", "", val.desc);
            }
        });
    } else {
        createInventoryItem();
    }

    if (state.isInventoryOpen === false) {
        inventoryBody.classList.add('collapsed'); 
        inventoryToggle.classList.add('collapsed-header');
    }

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
        loadCompConIframe();
        compconBody.classList.remove('collapsed');
        compconToggle.classList.remove('collapsed-header');
    }
    
    handleCompConPosition();

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
        if (target === 'page') { 
            document.body.style.backgroundImage = cssUrl; 
            localStorage.setItem('activePageBG', imageName); 
        }
        else { document.getElementById('main-card').style.backgroundImage = cssUrl; localStorage.setItem('activeCardBG', imageName); }
    };
}
function loadActiveBackgrounds() {
    const activePageBG = localStorage.getItem('activePageBG');
    const activeCardBG = localStorage.getItem('activeCardBG');
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    if (activePageBG) {
        store.get(activePageBG).onsuccess = (e) => { 
            if (e.target.result) {
                document.body.style.backgroundImage = `url(${e.target.result.data})`; 
            }
        };
    }
    if (activeCardBG) store.get(activeCardBG).onsuccess = (e) => { if (e.target.result) document.getElementById('main-card').style.backgroundImage = `url(${e.target.result.data})`; };
}
function deleteSelectedImage() {
    const selector = document.getElementById('image-selector');
    const imageName = selector.value;
    if (!imageName || !confirm(`¿Eliminar ${imageName}?`)) return;
    db.transaction([storeName], "readwrite").objectStore(storeName).delete(imageName).oncomplete = () => {
        populateImageSelector();
        if (localStorage.getItem('activePageBG') === imageName) { 
            localStorage.removeItem('activePageBG'); 
            const themeColor = document.documentElement.style.getPropertyValue('--border-primary') || '#00ffff';
            document.body.style.backgroundImage = `linear-gradient(rgba(${hexToRgb(themeColor)}, 0.05), rgba(${hexToRgb(themeColor)}, 0.05))`;
        }
        if (localStorage.getItem('activeCardBG') === imageName) { document.getElementById('main-card').style.backgroundImage = ''; localStorage.removeItem('activeCardBG'); }
    };
}
function resetBackgrounds() {
    document.body.style.backgroundImage = '';
    document.getElementById('main-card').style.backgroundImage = '';
    localStorage.removeItem('activePageBG');
    localStorage.removeItem('activeCardBG');
    const themeColor = document.documentElement.style.getPropertyValue('--border-primary') || '#00ffff';
    document.body.style.backgroundImage = `linear-gradient(rgba(${hexToRgb(themeColor)}, 0.05), rgba(${hexToRgb(themeColor)}, 0.05))`;
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

function handleCompConPosition() {
    const isHorizontal = compconCard.classList.contains('shape-horizontal');
    const isSquare = compconCard.classList.contains('shape-square');
    const isVertical = compconCard.classList.contains('shape-vertical');
    const isLoaded = !!compconFrame.getAttribute('src'); 
    
    const currentParent = compconCard.parentNode;
    
    appContainer.classList.remove('app-layout-stats-inv', 'app-layout-full-moved-square', 'app-layout-full-moved-vertical');
    
    if ((isSquare || isVertical) && isLoaded) {
        if (currentParent !== topBoardsContainer) {
            topBoardsContainer.appendChild(compconCard);
        }
        
        if (isSquare) appContainer.classList.add('app-layout-full-moved-square');
        if (isVertical) appContainer.classList.add('app-layout-full-moved-vertical');
        
    } else {
        if (currentParent !== appContainer) {
            appContainer.appendChild(compconCard);
        }
        
        appContainer.classList.add('app-layout-stats-inv');
    }
}

// Inicialización
initializeBoardColors();
loadBoardState();