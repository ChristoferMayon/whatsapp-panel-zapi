// ATENÇÃO: Esta URL precisa ser a URL REAL do seu proxy hospedado no Render.com.
// SUBSTITUA 'URL_DO_SEU_PROXY_HOSPEDADO_AQUI' pela URL que o Render te deu (ex: 'https://painel-whatsapp-proxy-api.onrender.com')
const proxyBaseUrl = 'URL_DO_SEU_PROXY_HOSPEDADO_AQUI'; // <--- SUBSTITUA AQUI PELA URL DO SEU RENDER.COM
const proxyCarouselUrl = `${proxyBaseUrl}/send-carousel-message`;

let cardCounter = 0; // Para dar IDs únicos aos cartões

// Adiciona um novo cartão ao carrossel
function addCarouselCard() {
    cardCounter++;
    const container = document.getElementById('carousel-cards-container');
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-editor bg-white p-5 rounded-lg shadow-md border border-gray-200';
    cardDiv.setAttribute('data-card-id', cardCounter);
    cardDiv.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Cartão #${cardCounter}</h3>
        <div class="space-y-3">
            <div>
                <label for="card-text-${cardCounter}" class="block text-sm font-medium text-gray-700 mb-1">Texto do Cartão:</label>
                <textarea id="card-text-${cardCounter}" rows="2" placeholder="Texto para este cartão"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"></textarea>
            </div>

            <div>
                <label for="card-image-${cardCounter}" class="block text-sm font-medium text-gray-700 mb-1">URL da Imagem do Cartão:</label>
                <input type="url" id="card-image-${cardCounter}" placeholder="https://exemplo.com/imagem.jpg"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm" />
            </div>
        </div>
        
        <h4 class="text-md font-semibold text-gray-700 mt-6 mb-3">Botões do Cartão #${cardCounter}</h4>
        <div id="card-buttons-container-${cardCounter}" class="space-y-3">
            <!-- Botões serão adicionados aqui -->
        </div>
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button class="add-button-btn flex-grow py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
                            onclick="addCardButton(${cardCounter})">
                + Adicionar Botão
            </button>
            <button class="remove-card-btn flex-grow py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
                            onclick="removeCarouselCard(${cardCounter})">
                - Remover Cartão
            </button>
        </div>
    `;
    container.appendChild(cardDiv);

    // Adiciona um botão padrão ao novo cartão
    addCardButton(cardCounter);
}

// Adiciona um novo botão a um cartão específico
function addCardButton(cardId) {
    const buttonsContainer = document.getElementById(`card-buttons-container-${cardId}`);
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-editor bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm';
    const buttonIndex = buttonsContainer.children.length; // Usa o índice para ID único dentro do cartão
    buttonDiv.innerHTML = `
        <div class="space-y-2">
            <div>
                <label for="button-type-${cardId}-${buttonIndex}" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Botão:</label>
                <select id="button-type-${cardId}-${buttonIndex}" onchange="toggleButtonFields(${cardId}, ${buttonIndex})"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm">
                    <option value="URL">URL</option>
                    <option value="REPLY">Resposta Rápida</option>
                    <option value="CALL">Ligar</option>
                </select>
            </div>

            <div>
                <label for="button-label-${cardId}-${buttonIndex}" class="block text-sm font-medium text-gray-700 mb-1">Texto do Botão:</label>
                <input type="text" id="button-label-${cardId}-${buttonIndex}" placeholder="Ex: Saiba Mais"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm" />
            </div>
            
            <div id="button-url-field-${cardId}-${buttonIndex}" class="button-field">
                <label for="button-url-${cardId}-${buttonIndex}" class="block text-sm font-medium text-gray-700 mb-1">URL:</label>
                <input type="url" id="button-url-${cardId}-${buttonIndex}" placeholder="https://exemplo.com/link"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm" />
            </div>
            <div id="button-phone-field-${cardId}-${buttonIndex}" class="button-field hidden">
                <label for="button-phone-${cardId}-${buttonIndex}" class="block text-sm font-medium text-gray-700 mb-1">Número de Telefone (com DDI, sem +):</label>
                <input type="text" id="button-phone-${cardId}-${buttonIndex}" placeholder="Ex: 5511999999999"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm" />
            </div>
            <input type="hidden" id="button-id-${cardId}-${buttonIndex}" value="btn_${cardId}_${buttonIndex}" />
        </div>
        <button class="remove-button-btn mt-4 py-2 px-4 bg-red-400 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-75 transition duration-150 ease-in-out">
            - Remover Botão
        </button>
    `;
    buttonsContainer.appendChild(buttonDiv);
    // Adiciona o event listener ao botão de remover recém-criado
    buttonDiv.querySelector('.remove-button-btn').onclick = () => removeCardButton(buttonDiv);
    toggleButtonFields(cardId, buttonIndex); // Inicializa os campos visíveis
}

// Alterna a visibilidade dos campos de URL/Telefone com base no tipo de botão
function toggleButtonFields(cardId, buttonIndex) {
    const buttonType = document.getElementById(`button-type-${cardId}-${buttonIndex}`).value;
    const urlField = document.getElementById(`button-url-field-${cardId}-${buttonIndex}`);
    const phoneField = document.getElementById(`button-phone-field-${cardId}-${buttonIndex}`);

    if (urlField) urlField.classList.add('hidden');
    if (phoneField) phoneField.classList.add('hidden');

    if (buttonType === 'URL') {
        if (urlField) urlField.classList.remove('hidden');
    } else if (buttonType === 'CALL') {
        if (phoneField) phoneField.classList.remove('hidden');
    }
    // REPLY não mostra nenhum campo adicional
}

// Remove um cartão específico do carrossel
function removeCarouselCard(cardId) {
    const cardDiv = document.querySelector(`.card-editor[data-card-id="${cardId}"]`);
    if (cardDiv) {
        cardDiv.remove();
    }
}

// Remove um botão específico de um cartão
function removeCardButton(buttonElementDiv) {
    buttonElementDiv.remove();
}


// Envia a mensagem de carrossel
async function enviarCarrossel() {
    const log = document.getElementById('log');
    const numero = document.getElementById('numero').value.trim();
    const mensagemGeral = document.getElementById('mensagemGeral').value.trim();
    const delayMessage = document.getElementById('delayMessage').value.trim();

    if (!numero || !mensagemGeral) {
        log.innerText = '❌ Por favor, preencha o número do cliente e a mensagem geral.';
        return;
    }

    const carouselCards = [];
    const cardEditors = document.querySelectorAll('.card-editor');

    if (cardEditors.length === 0) {
        log.innerText = '❌ Por favor, adicione pelo menos um cartão ao carrossel.';
        return;
    }

    for (const cardEditor of cardEditors) {
        const cardId = cardEditor.getAttribute('data-card-id');
        const cardText = document.getElementById(`card-text-${cardId}`).value.trim();
        const cardImage = document.getElementById(`card-image-${cardId}`).value.trim();

        if (!cardText || !cardImage) {
            log.innerText = `❌ O cartão #${cardId} requer texto e URL da imagem.`;
            return;
        }

        const cardButtons = [];
        const buttonEditors = cardEditor.querySelectorAll(`.button-editor`);
        
        for (let i = 0; i < buttonEditors.length; i++) {
            const buttonType = document.getElementById(`button-type-${cardId}-${i}`).value;
            const buttonLabel = document.getElementById(`button-label-${cardId}-${i}`).value.trim();
            const buttonId = document.getElementById(`button-id-${cardId}-${i}`).value.trim();

            if (!buttonLabel) {
                log.innerText = `❌ O botão #${i+1} do cartão #${cardId} requer um texto (label).`;
                return;
            }

            const button = {
                type: buttonType,
                label: buttonLabel,
                id: buttonId // Opcional, mas útil para identificar
            };

            if (buttonType === 'URL') {
                const buttonUrl = document.getElementById(`button-url-${cardId}-${i}`).value.trim();
                if (!buttonUrl) {
                    log.innerText = `❌ O botão URL #${i+1} do cartão #${cardId} requer uma URL.`;
                    return;
                }
                button.url = buttonUrl;
            } else if (buttonType === 'CALL') {
                const buttonPhone = document.getElementById(`button-phone-${cardId}-${i}`).value.trim();
                if (!buttonPhone) {
                    log.innerText = `❌ O botão de Chamada #${i+1} do cartão #${cardId} requer um número de telefone.`;
                    return;
                }
                button.phone = buttonPhone;
            }
            // REPLY não precisa de url nem phone

            cardButtons.push(button);
        }

        carouselCards.push({
            text: cardText,
            image: cardImage,
            buttons: cardButtons
        });
    }

    const payload = {
        phone: numero,
        message: mensagemGeral,
        carousel: carouselCards,
    };

    if (delayMessage) {
        payload.delayMessage = parseInt(delayMessage);
    }

    try {
        log.innerText = 'Enviando carrossel...';
        const response = await fetch(proxyCarouselUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            log.innerText = '✅ Carrossel enviado com sucesso:\n' + JSON.stringify(data, null, 2);
        } else {
            log.innerText = '❌ Erro ao enviar carrossel:\n' + JSON.stringify(data, null, 2);
            console.error('Erro na resposta do proxy:', data);
        }
    } catch (error) {
        log.innerText = '❌ Erro de conexão com o proxy:\n' + error.message;
        console.error('Erro de rede ou proxy:', error);
    }
}

// Adiciona um cartão inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    addCarouselCard(); 
});
