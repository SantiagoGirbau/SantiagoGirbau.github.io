<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LANCER | Pilot Stamina Tracker</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="card" id="main-card">
        
        <div id="settings-toggle" title="Abrir Configuración">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </div>

        <div id="settings-panel">
            <div class="settings-header">
                <h3>SYSTEM//CONFIG</h3>
                <button id="close-settings" class="mgr-btn exit">X</button>
            </div>

            <div class="settings-section">
                <h4>THEME & DISPLAY</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <select id="theme-selector">
                        <option value="#00ffff">Tema: Tech (Default)</option>
                    </select>
                    <button class="mgr-btn danger" onclick="resetBackgrounds()">Restaurar Fondos a Default</button>
                </div>
            </div>

            <div class="settings-section">
                <h4>IMAGE_MANAGER</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <input type="file" id="image-upload" accept="image/*">
                    <select id="image-selector">
                        <option value="">-- Seleccionar Imagen --</option>
                    </select>
                    <div style="display:flex; gap:5px; flex-wrap:wrap; justify-content:center;">
                        <button class="mgr-btn" onclick="applyImage('page')">Fondo General</button>
                        <button class="mgr-btn" onclick="applyImage('card')">Fondo Tablero</button>
                        <button class="mgr-btn danger" onclick="deleteSelectedImage()">Eliminar</button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h4>SECURITY_OVERRIDE</h4>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button id="unlock-name-btn" class="mgr-btn">Desbloquear Nombres</button>
                    <button id="unlock-pips-btn" class="mgr-btn">Desbloquear Pips (Editar Capacidad)</button>
                </div>
            </div>

            <div class="settings-section" style="margin-top: auto; border-top: 1px solid var(--border-secondary); padding-top: 15px;">
                <button id="hard-reset-btn" class="mgr-btn danger">SYSTEM//FACTORY_RESET</button>
            </div>
        </div>

        <div class="header">
            <div class="header-col-left">
                <input type="text" id="pilot-name" class="header-name" placeholder="CALLSIGN">
                
                <div class="pilot-stats-row">
                    <div class="grit-container">
                        <div class="grit-label">LVL</div>
                        <input type="number" id="level-value" class="attr-value grit-input" value="0" min="0">
                    </div>
                    <div class="grit-container">
                        <div class="grit-label">GRIT</div>
                        <input type="number" id="grit-value" class="attr-value grit-input" value="0" min="0">
                    </div>
                    <div class="grit-container">
                        <div class="grit-label">EVA</div>
                        <input type="number" id="evasion-value" class="attr-value grit-input" value="8" min="0">
                    </div>
                </div>
                
            </div>
            
            <div class="header-col-right">
                <input type="text" id="mech-class" class="header-class" placeholder="FRAME">
                
                <div id="lock-icon-container" title="Bloquear Identificación">
                    <svg id="lock-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    </svg>
                </div>
            </div>
        </div>

        <div id="stats-container">
            </div>

        <div class="board-footer">
            <div id="pips-lock-container" title="Fijar Capacidad (Bloquear Edición)">
                <svg id="pips-lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                </svg>
            </div>
            <button id="rest-btn" class="mgr-btn rest-btn">SYSTEM//REST</button>
        </div>
    </div>

    <div class="card collapsible-card" id="inventory-card">
        <div class="card-header toggle-header" id="inventory-toggle">
            <h3>SYSTEM//INVENTORY_&_NOTES</h3>
            <span id="inventory-chevron">▼</span>
        </div>
        
        <div id="inventory-body" class="card-body">
            <div class="settings-section" style="margin-bottom: 20px;">
                <h4>MISSION_NOTES</h4>
                <textarea id="pilot-notes" class="lancer-textarea" placeholder="Log pilot data, mission objectives, or anomalies here..."></textarea>
            </div>
            
            <article class="settings-section" style="margin-bottom: 20px;">
                <h4>CREDITS</h4>
                <input type="number" id="credits-input" class="inv-input" placeholder="CR$">
            </article>

            <div class="settings-section">
                <h4>EQUIPMENT_//_CARGO</h4>
                <div id="inventory-list">
                    </div>
                <button id="add-item-btn" class="mgr-btn" style="margin-top: 10px; width: auto; padding: 6px 20px;">+ ADD_ITEM</button>
            </div>
        </div>
    </div>

    <div id="reset-modal" class="modal-overlay">
        <div class="modal-box">
            <h3 style="color: var(--border-secondary); margin-top:0;">WARNING: PURGE PROTOCOL</h3>
            <p style="font-size: 0.95rem; margin-bottom: 25px;">Estás a punto de borrar todos los datos, pips, inventario, configuraciones e imágenes de este piloto. Esta acción es irreversible.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="cancel-reset-btn" class="mgr-btn" style="flex:1;">CANCELAR</button>
                <button id="confirm-reset-btn" class="mgr-btn danger" style="flex:1;" disabled>CONFIRMAR (3)</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
