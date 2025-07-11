const express = require('express');
require('dotenv').config(); // Carrega variáveis do arquivo .env
const cors = require('cors');
const axios = require('axios'); // Adicionado axios para consistência nas requisições HTTP

const app = express();
// A porta para o servidor. Usa a porta do ambiente de hospedagem (Render) ou 3001 localmente.
const port = process.env.PORT || 3000; 

// SUAS CREDENCIAIS DA Z-API. Lidas do process.env (DO ARQUIVO .env)
const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID; 
const ZAPI_ACCOUNT_SECURITY_TOKEN = process.env.ZAPI_ACCOUNT_SECURITY_TOKEN; 
const ZAPI_INSTANCE_PATH_TOKEN = process.env.ZAPI_INSTANCE_PATH_TOKEN;

// Verifica se as credenciais foram carregadas
if (!ZAPI_INSTANCE_ID || !ZAPI_ACCOUNT_SECURITY_TOKEN || !ZAPI_INSTANCE_PATH_TOKEN) {
    console.error("ERRO: As variáveis de ambiente da Z-API não foram carregadas. Verifique seu arquivo .env ou as configurações de ambiente.");
    // Em produção, você pode querer encerrar o processo: process.exit(1);
}

console.log("Variáveis de Ambiente Carregadas:");
console.log("- ZAPI_INSTANCE_ID:", ZAPI_INSTANCE_ID ? "Carregado" : "NÃO CARREGADO"); 
console.log("- ZAPI_ACCOUNT_SECURITY_TOKEN (no cabeçalho):", ZAPI_ACCOUNT_SECURITY_TOKEN ? "Carregado" : "NÃO CARREGADO"); 
console.log("- ZAPI_INSTANCE_PATH_TOKEN (na URL):", ZAPI_INSTANCE_PATH_TOKEN ? "Carregado" : "NÃO CARREGADO");
console.log("-----------------------------------------");

// CORS Configuration: Permite requisições da origem específica do seu frontend no GitHub Pages
app.use(cors({
    origin: 'https://christofermayon.github.io' // URL BASE do seu GitHub Pages
}));

// Middleware para analisar corpos de requisição JSON
app.use(express.json());

// ==============================================================================
// ROTA 1: Para ENVIAR MENSAGENS COM BOTÕES (Usado por index.html)
// ==============================================================================
app.post('/send-whatsapp-message', async (req, res) => {
    try {
        const { numero, mensagem, tituloBotao, linkBotao } = req.body;

        // --- ADIÇÃO DE LOG (Payload recebido do frontend - Rota de Botão) ---
        console.log("--- ROTA /send-whatsapp-message ---");
        console.log("Payload recebido do frontend:", JSON.stringify(req.body, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (!numero || !mensagem || !tituloBotao || !linkBotao) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios para enviar a mensagem com botão.' });
        }

        const payloadParaZapi = {
            phone: numero,
            message: mensagem,
            footer: "Unlock Apple",
            buttonActions: [
                {
                    id: "1",
                    type: "URL",
                    url: linkBotao,
                    label: tituloBotao
                }
            ]
        };

        // --- ADIÇÃO DE LOG (Payload enviado para Z-API - Rota de Botão) ---
        console.log("Payload enviado para a Z-API:", JSON.stringify(payloadParaZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        // URL da API da Z-API para enviar mensagens com botões
        const zapiApiUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/send-multi-carousel`; 

        const zapiResponse = await axios.post(zapiApiUrl, payloadParaZapi, { // Usando axios.post
            headers: {
                "Content-Type": "application/json",
                "Client-Token": ZAPI_ACCOUNT_SECURITY_TOKEN 
            }
        });

        const dataFromZapi = zapiResponse.data; // Axios retorna data diretamente

        // --- ADIÇÃO DE LOG (Resposta da Z-API - Rota de Botão) ---
        console.log("Resposta da Z-API (sucesso):", JSON.stringify(dataFromZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (zapiResponse.status >= 200 && zapiResponse.status < 300) { // Verifica se o status é de sucesso
            res.status(zapiResponse.status).json(dataFromZapi);
        } else {
            console.error('Erro retornado pela Z-API (send-button-actions - status não-ok):', dataFromZapi);
            res.status(zapiResponse.status).json({
                error: 'Erro da Z-API',
                message: dataFromZapi.message || 'Verifique os detalhes na resposta da Z-API.',
                details: dataFromZapi
            });
        }

    } catch (error) {
        // --- ADIÇÃO DE LOG (Erro da Z-API - Rota de Botão - CATCH) ---
        console.error('Erro interno no servidor proxy ao processar send-button-actions (CATCH):', error.response ? error.response.data : error.message);
        // --- FIM DA ADIÇÃO DE LOG ---
        res.status(error.response ? error.response.status : 500).json({ error: 'Erro interno do servidor', message: error.message });
    }
});

// ==============================================================================
// ROTA 2: Para ENVIAR MENSAGENS CARROSSEL (Usado por carousel_panel_stylish.html)
// ==============================================================================
app.post('/send-carousel-message', async (req, res) => {
    try {
        const { phone, message, carousel, delayMessage } = req.body;

        // --- ADIÇÃO DE LOG (Payload recebido do frontend - Rota de Carrossel) ---
        console.log("--- ROTA /send-carousel-message ---");
        console.log("Payload recebido do frontend:", JSON.stringify(req.body, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (!phone || !message || !carousel || !Array.isArray(carousel) || carousel.length === 0) {
            return res.status(400).json({ error: 'Campos "phone", "message" e "carousel" (array não vazio) são obrigatórios para enviar carrossel.' });
        }

        // Validação básica dos cartões do carrossel
        for (const card of carousel) {
            if (!card.text || !card.image) {
                return res.status(400).json({ error: 'Cada cartão do carrossel deve ter "text" e "image".' });
            }
            if (card.buttons && !Array.isArray(card.buttons)) {
                return res.status(400).json({ error: 'Os botões de um cartão devem ser um array.' });
            }
        }

        const payloadParaZapi = {
            phone: phone,
            message: message, 
            carousel: carousel, 
            ...(delayMessage && { delayMessage: delayMessage }) 
        };

        // --- ADIÇÃO DE LOG (Payload enviado para Z-API - Rota de Carrossel) ---
        console.log("Payload enviado para a Z-API:", JSON.stringify(payloadParaZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        const zapiApiUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_INSTANCE_PATH_TOKEN}/send-carousel`;

        const zapiResponse = await axios.post(zapiApiUrl, payloadParaZapi, { // Usando axios.post
            headers: {
                "Content-Type": "application/json",
                "Client-Token": ZAPI_ACCOUNT_SECURITY_TOKEN 
            }
        });

        const dataFromZapi = zapiResponse.data; 

        // --- ADIÇÃO DE LOG (Resposta da Z-API - Rota de Carrossel) ---
        console.log("Resposta da Z-API (sucesso):", JSON.stringify(dataFromZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (zapiResponse.status >= 200 && zapiResponse.status < 300) { 
            res.status(zapiResponse.status).json(dataFromZapi);
        } else {
            console.error('Erro retornado pela Z-API (send-carousel - status não-ok):', dataFromZapi);
            res.status(zapiResponse.status).json({
                error: 'Erro da Z-API',
                message: dataFromZapi.message || 'Verifique os detalhes na resposta da Z-API.',
                details: dataFromZapi
            });
        }

    } catch (error) {
        // --- ADIÇÃO DE LOG (Erro da Z-API - Rota de Carrossel - CATCH) ---
        console.error('Erro interno no servidor proxy ao processar send-carousel (CATCH):', error.response ? error.response.data : error.message);
        // --- FIM DA ADIÇÃO DE LOG ---
        res.status(error.response ? error.response.status : 500).json({ error: 'Erro interno do servidor', message: error.message });
    }
});

// ==============================================================================
// ROTA 3: Para ENVIAR MENSAGENS DE TEXTO SIMPLES (send-text)
// ==============================================================================
app.post('/send-simple-text', async (req, res) => {
    try {
        const { phone, message } = req.body; 

        // --- ADIÇÃO DE LOG (Payload recebido do frontend - Rota de Texto Simples) ---
        console.log("--- ROTA /send-simple-text ---");
        console.log("Payload recebido do frontend:", JSON.stringify(req.body, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (!phone || !message) {
            return res.status(400).json({ error: 'Campos "phone" e "message" são obrigatórios para enviar texto simples.' });
        }

        const payloadParaZapi = {
            phone: phone,
            message: message
        };

        // --- ADIÇÃO DE LOG (Payload enviado para Z-API - Rota de Texto Simples) ---
        console.log("Payload enviado para a Z-API:", JSON.stringify(payloadParaZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        const zapiApiUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_INSTANCE_PATH_TOKEN}/send-text`;

        const zapiResponse = await axios.post(zapiApiUrl, payloadParaZapi, { // Usando axios.post
            headers: {
                "Content-Type": "application/json",
                "Client-Token": ZAPI_ACCOUNT_SECURITY_TOKEN 
            }
        });

        const dataFromZapi = zapiResponse.data; 

        // --- ADIÇÃO DE LOG (Resposta da Z-API - Rota de Texto Simples) ---
        console.log("Resposta da Z-API (sucesso):", JSON.stringify(dataFromZapi, null, 2));
        // --- FIM DA ADIÇÃO DE LOG ---

        if (zapiResponse.status >= 200 && zapiResponse.status < 300) { 
            res.status(zapiResponse.status).json(dataFromZapi);
        } else {
            console.error('Erro retornado pela Z-API (send-text - status não-ok):', dataFromZapi);
            res.status(zapiResponse.status).json({
                error: 'Erro da Z-API',
                message: dataFromZapi.message || 'Verifique os detalhes na resposta da Z-API.',
                details: dataFromZapi
            });
        }

    } catch (error) {
        // --- ADIÇÃO DE LOG (Erro da Z-API - Rota de Texto Simples - CATCH) ---
        console.error('Erro interno no servidor proxy ao processar send-text (CATCH):', error.response ? error.response.data : error.message);
        // --- FIM DA ADIÇÃO DE LOG ---
        res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
    }
});


// Inicia o servidor proxy
app.listen(port, () => {
    console.log(`Servidor proxy Node.js rodando na porta ${port}`);
    console.log('Abra seu arquivo HTML no navegador para testar localmente.');
});
