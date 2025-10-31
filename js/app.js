// ======================================================
// 🚀 SISTEMA DE GESTÃO DE PERFIS RM - OBRAS & PROJETOS
// ======================================================

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, iniciando aplicação...');
    
    try {
        // Mostra a primeira etapa imediatamente
        showStep(1);
        
        // Configura os eventos
        setupEventListeners();
        
        // Inicializa os perfis
        initProfiles();
        
        // Carrega os menus
        console.log('Iniciando carregamento dos menus...');
        await loadMenus();
        
        // Marca o body como carregado
        document.body.classList.add('loaded');
        console.log('✅ Aplicação carregada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        showError('Erro ao carregar a aplicação. Recarregue a página.');
    }
});

// ===============================
// FUNÇÕES PRINCIPAIS
// ===============================
async function loadMenus() {
    try {
        console.log('Carregando menus...');
        const response = await fetch('data/menus.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Menus carregados:', data);
        
        // Atualiza os menus no CONFIG
        CONFIG.menus = data;
        
        // Renderiza a árvore de menus
        if (elements.menuTree) {
            renderMenuTree(data.modulos || data, elements.menuTree);
        }
        
        return data;
    } catch (error) {
        const errorMsg = `Erro ao carregar menus: ${error.message}`;
        console.error(errorMsg, error);
        
        // Mostra mensagem de erro na interface
        if (elements.menuTree) {
            elements.menuTree.innerHTML = `
                <div class="text-red-500 p-4 text-center">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>${errorMsg}</p>
                    <p class="text-sm mt-2">Verifique se o arquivo menus.json existe na pasta data/</p>
                </div>
            `;
        }
        
        showError(errorMsg);
        return null;
    }
}

// Renderiza os botões de perfil
function initProfiles() {
    elements.profilesContainer.innerHTML = '';
    Object.entries(CONFIG.profiles).forEach(([id, profile]) => {
        const button = document.createElement('button');
        button.className = `profile-btn p-4 sm:p-6 border-2 rounded-lg text-center transition-all ${profile.color} hover:shadow-md flex flex-col items-center`;
        button.innerHTML = `
            <i class="fas fa-${profile.icon} text-2xl sm:text-3xl mb-2"></i>
            <span class="font-medium text-sm sm:text-base">${profile.name}</span>
        `;
        button.dataset.profileId = id;

        button.addEventListener('click', () => {
            document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'scale-95'));
            button.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500', 'scale-95');
            CONFIG.currentProfile = id;
            elements.nextStep2.disabled = false;
        });
        elements.profilesContainer.appendChild(button);
    });
}

// ===============================
// EVENTOS DE NAVEGAÇÃO
// ===============================
function setupEventListeners() {
    // Seleção do módulo
    document.querySelectorAll('.module-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'scale-95'));
            this.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'scale-95');
            CONFIG.currentModule = this.dataset.module;
            elements.nextStep1.disabled = false;
        });
    });

    // Botões de navegação
    console.log('Configurando botões de navegação...');
    console.log('nextStep1:', elements.nextStep1);
    console.log('prevStep2:', elements.prevStep2);
    console.log('nextStep2:', elements.nextStep2);
    console.log('prevStep3:', elements.prevStep3);

    if (elements.nextStep1) {
        elements.nextStep1.addEventListener('click', (e) => {
            console.log('Clicou em Próximo (1->2)');
            e.preventDefault();
            console.log('Módulo selecionado:', CONFIG.currentModule);
            if (!CONFIG.currentModule) {
                console.error('Nenhum módulo selecionado');
                showError('Selecione um módulo antes de continuar.');
                return;
            }
            console.log('Chamando showStep(2)');
            showStep(2);
        });
    } else {
        console.error('Botão nextStep1 não encontrado!');
    }
    
    if (elements.prevStep2) {
        elements.prevStep2.addEventListener('click', (e) => {
            console.log('Clicou em Voltar (2->1)');
            e.preventDefault();
            showStep(1);
        });
    } else {
        console.error('Botão prevStep2 não encontrado!');
    }
    
    if (elements.nextStep2) {
        elements.nextStep2.addEventListener('click', (e) => {
            console.log('Clicou em Próximo (2->3)');
            e.preventDefault();
            console.log('Perfil selecionado:', CONFIG.currentProfile);
            if (!CONFIG.currentProfile) {
                console.error('Nenhum perfil selecionado');
                showError('Selecione um perfil antes de continuar.');
                return;
            }
            showStep(3);
            renderMenuTree();
        });
    } else {
        console.error('Botão nextStep2 não encontrado!');
    }
    
    if (elements.prevStep3) {
        elements.prevStep3.addEventListener('click', (e) => {
            console.log('Clicou em Voltar (3->2)');
            e.preventDefault();
            showStep(2);
        });
    } else {
        console.error('Botão prevStep3 não encontrado!');
    }

    // Botões de ação
    elements.selectAll.addEventListener('click', () => toggleAllCheckboxes(true));
    elements.deselectAll.addEventListener('click', () => toggleAllCheckboxes(false));
    elements.expandAll.addEventListener('click', expandAllMenus);
    elements.collapseAll.addEventListener('click', collapseAllMenus);

    // Salvar perfil
    elements.saveSettings.addEventListener('click', () => {
        if (CONFIG.selectedMenus.size === 0) return showError('Selecione pelo menos um menu.');
        elements.exportModal.classList.remove('hidden');
        elements.profileName.value = CONFIG.profiles[CONFIG.currentProfile]?.name || 'Perfil';
        updateFileNamePreview();
    });

    // Exportação
    elements.closeExportModal.addEventListener('click', closeExportModal);
    elements.cancelExport.addEventListener('click', closeExportModal);
    elements.exportJson.addEventListener('click', exportProfile);
    elements.profileName.addEventListener('input', updateFileNamePreview);
}

// ===============================
// FUNÇÕES DE INTERFACE
// ===============================
function showStep(stepNumber) {
    console.log(`\n=== INÍCIO showStep(${stepNumber}) ===`);
    
    // Verifica se os elementos existem
    if (!elements.step1 || !elements.step2 || !elements.step3) {
        console.error('Algum elemento de etapa não foi encontrado:', {
            step1: !!elements.step1,
            step2: !!elements.step2,
            step3: !!elements.step3
        });
        return;
    }
    
    // Esconde todas as etapas
    console.log('Escondendo todas as etapas...');
    [elements.step1, elements.step2, elements.step3].forEach((step, index) => {
        if (step) {
            console.log(`Escondendo step${index + 1} (${step.id})`);
            step.classList.add('hidden');
        } else {
            console.error(`Elemento step${index + 1} não encontrado!`);
        }
    });
    
    // Mostra a etapa atual
    const stepId = `step${stepNumber}`;
    console.log(`\nProcurando elemento: #${stepId}`);
    const currentStep = document.getElementById(stepId);
    
    if (currentStep) {
        console.log(`Mostrando ${stepId}`, currentStep);
        console.log('Classes antes:', currentStep.className);
        
        // Remove a classe hidden
        currentStep.classList.remove('hidden');
        console.log('Classes depois:', currentStep.className);
        
        // Verifica se a classe foi removida
        console.log('Está visível?', window.getComputedStyle(currentStep).display !== 'none');
    } else {
        console.error(`Elemento ${stepId} não encontrado!`);
    }
    
    // Atualiza os indicadores de progresso
    updateStepIndicators(stepNumber);
    
    console.log(`=== FIM showStep(${stepNumber}) ===\n`);
}

function updateStepIndicators(currentStep) {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        const indicatorDot = indicator.querySelector('.indicator');
        
        if (stepNumber < currentStep) {
            // Etapas anteriores
            indicator.classList.add('completed');
            indicatorDot.innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNumber === currentStep) {
            // Etapa atual
            indicator.classList.add('active');
            indicator.classList.remove('completed');
            indicatorDot.textContent = stepNumber;
        } else {
            // Etapas futuras
            indicator.classList.remove('active', 'completed');
            indicatorDot.textContent = stepNumber;
        }
    });
}

// ===============================
// FUNÇÕES DA ÁRVORE DE MENUS
// ===============================
function renderMenuTree(menus = CONFIG.menus, parent = elements.menuTree) {
    if (!menus) {
        console.error('Estrutura de menus não carregada.');
        return showError('Estrutura de menus não carregada.');
    }

    console.log('Renderizando árvore de menus...', { menus, parent });
    
    if (!parent) {
        console.error('Elemento pai para a árvore de menus não encontrado');
        return showError('Erro ao renderizar o menu. Elemento pai não encontrado.');
    }
    
    parent.innerHTML = '';

    if (menus.modulos) {
        menus = menus.modulos;
    }

    if (!Array.isArray(menus)) {
        console.error('Formato inválido para menus:', menus);
        return showError('Formato de menus inválido. Verifique o arquivo de configuração.');
    }

    const ul = document.createElement('ul');
    ul.className = 'space-y-1';

    menus.forEach(menu => {
        const hasChildren = menu.submenus && menu.submenus.length > 0;
        const li = document.createElement('li');
        li.className = 'menu-item';
        li.dataset.id = menu.id;

        // Cria o conteúdo principal do item
        const itemContent = document.createElement('div');
        itemContent.className = 'menu-item-content flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer';
        itemContent.innerHTML = `
            <input type="checkbox" id="menu-${menu.id}" class="menu-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
            <label for="menu-${menu.id}" class="ml-2 flex-1 cursor-pointer">${menu.nome}</label>
            ${hasChildren ? `<button class="expand-btn ml-2 text-gray-500 hover:text-gray-700">
                <i class="fas fa-chevron-down"></i>
            </button>` : ''}
        `;

        // Adiciona o evento de clique no item
        itemContent.addEventListener('click', (e) => {
            // Não faz nada se o clique foi no checkbox ou no botão de expandir
            if (e.target.tagName === 'INPUT' || e.target.closest('.expand-btn')) {
                return;
            }
            
            // Alterna o estado do checkbox
            const checkbox = itemContent.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                updateCheckboxStates(checkbox);
            }
        });

        // Adiciona o evento de clique no checkbox
        const checkbox = itemContent.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                updateCheckboxStates(checkbox);
            });
        }

        // Adiciona o evento de clique no botão de expandir
        if (hasChildren) {
            const expandBtn = itemContent.querySelector('.expand-btn');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const submenu = li.querySelector('ul');
                if (submenu) {
                    const isExpanded = submenu.classList.toggle('hidden');
                    const icon = expandBtn.querySelector('i');
                    if (isExpanded) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    } else {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            });
        }

        li.appendChild(itemContent);

        // Adiciona os submenus
        if (hasChildren) {
            const submenu = document.createElement('div');
            submenu.className = 'pl-4 mt-1 ml-4 border-l-2 border-gray-200';
            renderMenuTree(menu.submenus, submenu);
            li.appendChild(submenu);
        }

        ul.appendChild(li);
    });

    parent.appendChild(ul);
}

function updateCheckboxStates(checkbox) {
    const menuItem = checkbox.closest('.menu-item');
    const isChecked = checkbox.checked;
    const menuId = menuItem.dataset.id;

    // Atualiza o estado do item atual
    if (isChecked) {
        CONFIG.selectedMenus.add(menuId);
        menuItem.classList.add('selected');
    } else {
        CONFIG.selectedMenus.delete(menuId);
        menuItem.classList.remove('selected');
    }

    // Atualiza o estado dos itens filhos
    const submenu = menuItem.querySelector('ul');
    if (submenu) {
        const childCheckboxes = submenu.querySelectorAll('input[type="checkbox"]');
        childCheckboxes.forEach(childCheckbox => {
            childCheckbox.checked = isChecked;
            updateCheckboxStates(childCheckbox);
        });
    }

    // Atualiza o estado dos itens pais
    updateParentCheckboxes(menuItem);
}

function updateParentCheckboxes(menuItem) {
    const parentMenuItem = menuItem.parentElement.closest('.menu-item');
    if (!parentMenuItem) return;

    const parentCheckbox = parentMenuItem.querySelector('input[type="checkbox"]');
    if (!parentCheckbox) return;

    const siblingItems = parentMenuItem.querySelectorAll('.menu-item > .menu-item-content > input[type="checkbox"]');
    const checkedSiblings = Array.from(siblingItems).filter(cb => cb.checked);
    
    if (checkedSiblings.length === 0) {
        // Nenhum filho selecionado
        parentCheckbox.checked = false;
        parentCheckbox.indeterminate = false;
        CONFIG.selectedMenus.delete(parentMenuItem.dataset.id);
        parentMenuItem.classList.remove('selected');
    } else if (checkedSiblings.length === siblingItems.length) {
        // Todos os filhos selecionados
        parentCheckbox.checked = true;
        parentCheckbox.indeterminate = false;
        CONFIG.selectedMenus.add(parentMenuItem.dataset.id);
        parentMenuItem.classList.add('selected');
    } else {
        // Alguns filhos selecionados
        parentCheckbox.checked = false;
        parentCheckbox.indeterminate = true;
        CONFIG.selectedMenus.add(parentMenuItem.dataset.id);
        parentMenuItem.classList.add('selected');
    }

    // Atualiza o avô
    updateParentCheckboxes(parentMenuItem);
}

function toggleAllCheckboxes(select) {
    const checkboxes = elements.menuTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = select;
        updateCheckboxStates(checkbox);
    });
}

function expandAllMenus() {
    const allSubmenus = elements.menuTree.querySelectorAll('.menu-item > div + div');
    allSubmenus.forEach(submenu => {
        submenu.classList.remove('hidden');
        const expandBtn = submenu.previousElementSibling.querySelector('.expand-btn');
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    });
}

function collapseAllMenus() {
    const allSubmenus = elements.menuTree.querySelectorAll('.menu-item > div + div');
    allSubmenus.forEach(submenu => {
        submenu.classList.add('hidden');
        const expandBtn = submenu.previousElementSibling.querySelector('.expand-btn');
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });
}

// ===============================
// FUNÇÕES DE EXPORTAÇÃO
// ===============================
function updateFileNamePreview() {
    if (!elements.fileNamePreview) return;
    
    const profileName = elements.profileName.value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    
    elements.fileNamePreview.textContent = `perfil_${profileName || 'nome'}.json`;
}

function closeExportModal() {
    elements.exportModal.classList.add('hidden');
}

function exportProfile() {
    const profileName = elements.profileName.value.trim() || 'Perfil';
    const fileName = `perfil_${profileName.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const exportData = {
        perfil: profileName,
        modulo: CONFIG.currentModule,
        tipoPerfil: CONFIG.currentProfile,
        data: new Date().toISOString(),
        menus: Array.from(CONFIG.selectedMenus)
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    closeExportModal();
    showSuccess('Perfil exportado com sucesso!');
}