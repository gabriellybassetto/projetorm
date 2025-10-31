// Configuração global da aplicação
const CONFIG = {
    currentModule: null,
    currentProfile: null,
    selectedMenus: new Set(),
    menus: null,
    profiles: {
        'supervisor': { name: 'Supervisor', icon: 'user-tie', color: 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' },
        'analista': { name: 'Analista', icon: 'user-cog', color: 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' },
        'assistente': { name: 'Assistente', icon: 'user-edit', color: 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200' },
        'estagiario': { name: 'Estagiário', icon: 'user-graduate', color: 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200' }
    }
};

// Elementos da interface
const elements = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    menuTree: document.getElementById('menuTree'),
    profilesContainer: document.getElementById('profiles-container'),
    nextStep1: document.getElementById('nextStep1'),
    prevStep2: document.getElementById('prevStep2'),
    nextStep2: document.getElementById('nextStep2'),
    prevStep3: document.getElementById('prevStep3'),
    selectAll: document.getElementById('selectAll'),
    deselectAll: document.getElementById('deselectAll'),
    expandAll: document.getElementById('expandAll'),
    collapseAll: document.getElementById('collapseAll'),
    saveSettings: document.getElementById('saveSettings'),
    exportModal: document.getElementById('exportModal'),
    closeExportModal: document.getElementById('closeExportModal'),
    profileName: document.getElementById('profileName'),
    fileNamePreview: document.getElementById('fileNamePreview'),
    exportJson: document.getElementById('exportJson'),
    cancelExport: document.getElementById('cancelExport'),
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notificationMessage')
};

// Função para mostrar mensagem de erro
function showError(message) {
    if (elements.notification && elements.notificationMessage) {
        elements.notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 opacity-100 z-50 max-w-xs';
        elements.notificationMessage.textContent = message;
        elements.notification.classList.remove('hidden');
        
        // Esconde a notificação após 5 segundos
        setTimeout(() => {
            elements.notification.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => elements.notification.classList.add('hidden'), 300);
        }, 5000);
    } else {
        console.error('Elementos de notificação não encontrados');
        alert(message);
    }
}

// Função para mostrar mensagem de sucesso
function showSuccess(message) {
    if (elements.notification && elements.notificationMessage) {
        elements.notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 opacity-100 z-50 max-w-xs';
        elements.notificationMessage.textContent = message;
        elements.notification.classList.remove('hidden');
        
        // Esconde a notificação após 5 segundos
        setTimeout(() => {
            elements.notification.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => elements.notification.classList.add('hidden'), 300);
        }, 5000);
    } else {
        console.log('Sucesso:', message);
    }
}