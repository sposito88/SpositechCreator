document.addEventListener('DOMContentLoaded', function() {
    // Estado inicial da aplicação
    let currentLanguage = localStorage.getItem('language') || 'pt-BR';
    let darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Referências aos elementos DOM
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const languageItems = document.querySelectorAll('.dropdown-item[data-lang]');
    const languageText = document.getElementById('currentLanguage');
    const contentForm = document.getElementById('contentForm');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Inicialização da interface
    initializeApp();
    
    // Event listeners
    darkModeSwitch.addEventListener('change', toggleDarkMode);
    languageItems.forEach(item => {
        item.addEventListener('click', changeLanguage);
    });
    contentForm.addEventListener('submit', handleFormSubmit);
    
    /**
     * Inicializa a aplicação com as configurações salvas
     */
    function initializeApp() {
        // Restaurar idioma
        if (translations[currentLanguage]) {
            languageText.textContent = currentLanguage.toUpperCase();
        }
        
        // Aplicar traduções
        applyTranslations(currentLanguage);
        
        // Restaurar tema
        darkModeSwitch.checked = darkMode;
        applyTheme(darkMode);
    }
    
    /**
     * Alterna entre os modos claro e escuro
     */
    function toggleDarkMode() {
        darkMode = darkModeSwitch.checked;
        applyTheme(darkMode);
        
        // Salvar preferência
        localStorage.setItem('darkMode', darkMode);
    }
    
    /**
     * Aplica o tema baseado no modo escuro
     * @param {boolean} isDarkMode - Se o modo escuro está ativado
     */
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
        }
    }
    
    /**
     * Muda o idioma da interface
     * @param {Event} e - Evento de clique
     */
    function changeLanguage(e) {
        e.preventDefault();
        const lang = e.target.getAttribute('data-lang');
        
        if (lang && translations[lang]) {
            currentLanguage = lang;
            languageText.textContent = lang.toUpperCase();
            applyTranslations(lang);
            
            // Salvar preferência
            localStorage.setItem('language', lang);
        }
    }
    
    /**
     * Aplica as traduções baseado no idioma selecionado
     * @param {string} lang - Código do idioma
     */
    function applyTranslations(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });
    }
    
    /**
     * Manipula o envio do formulário para o webhook
     * @param {Event} e - Evento de envio do formulário
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const toneSelect = document.getElementById('toneSelect');
        const typeSelect = document.getElementById('typeSelect');
        const subjectInput = document.getElementById('subjectInput');
        
        const tone = toneSelect.value;
        const contentType = typeSelect.value;
        const subject = subjectInput.value.trim();
        
        if (!tone || !contentType || !subject) {
            return; // Formulário inválido, o Bootstrap já mostrará validação
        }
        
        // Mostrar animação de carregamento e desabilitar botão
        loadingAnimation.classList.remove('d-none');
        resultContainer.classList.add('d-none');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${translations[currentLanguage].generating || 'Gerando...'}`;
        
        try {
            const response = await fetch('https://n8n.spositech.com.br/webhook/createspositech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tone: tone,
                    contentType: contentType,
                    subject: subject,
                    language: currentLanguage
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Exibir resultado
            if (data && data.result) {
                // Formato esperado: { result: "texto de resposta" }
                resultContent.textContent = data.result;
                resultContainer.classList.remove('d-none');
            } else if (data && data.length > 0 && data[0].output) {
                // Formato alternativo: [ { output: "texto de resposta" } ]
                resultContent.textContent = data[0].output;
                resultContainer.classList.remove('d-none');
            } else {
                console.log('Resposta recebida:', data);
                throw new Error(currentLanguage === 'pt-BR' ? 
                    `Formato de resposta inválido. Verifique o console para detalhes.` : 
                    `Invalid response format. Check console for details.`);
            }
        } catch (error) {
            console.error('Erro ao enviar requisição:', error);
            resultContent.textContent = currentLanguage === 'pt-BR' ? 
                `Erro: ${error.message}. Verifique se o servidor n8n está configurado corretamente.` : 
                `Error: ${error.message}. Check if the n8n server is properly configured.`;
            resultContainer.classList.remove('d-none');
        } finally {
            // Ocultar a animação de carregamento e restaurar o botão
            loadingAnimation.classList.add('d-none');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}); 