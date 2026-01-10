export default async function handler(req, res) {
    // Bloqueia métodos que não sejam POST
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // 1. CONFIGURAÇÃO DE AMBIENTE (DINÂMICA)
    // O VERCEL_ENV identifica se o site é o oficial ou um link de teste/preview
    const isProduction = process.env.VERCEL_ENV === 'production';

    // Puxa as chaves renomeadas conforme sua configuração na Vercel
    const ASAAS_API_KEY = isProduction 
        ? process.env.ASAAS_API_KEY_PROD  
        : process.env.ASAAS_API_KEY_SANDBOX;

    // Define a URL do Asaas (Real ou Sandbox)
    const ASAAS_URL = isProduction 
        ? 'https://www.asaas.com/api/v3'       
        : 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 2. LÓGICA DE URL PARA O BOTÃO "IR PARA O SITE"
        // Captura dinamicamente o link atual para evitar erro de "URL válida"
        const referer = req.headers.referer || "https://nuvem-de-essencias.vercel.app";
        const urlDinamica = referer.split('?')[0];

        // 3. CRIAR OU LOCALIZAR CLIENTE NO ASAAS
        const customerRes = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 
                'access_token': ASAAS_API_KEY, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: cliente.nome,
                email: cliente.email,
                cpfCnpj: cliente.cpfCnpj,
                mobilePhone: cliente.telefone,
                notificationDisabled: true
            })
        });

        const customerData = await customerRes.json();
        
        // Se o Asaas retornar erro na criação do cliente (ex: CPF inválido)
        if (customerData.errors) {
            return res.status(400).json({ error: customerData.errors[0].description });
        }

        // 4. MONTAR CORPO DO PAGAMENTO (CONFORME DOCUMENTAÇÃO ASAAS V3)
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vencimento em 24h
            value: pagamento.valor,
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            
            // Configura o retorno para a sua loja após o pagamento
            callback: {
                successUrl: urlDinamica, 
                autoRedirect: false      // Exibe o botão "Ir para o site" no checkout do Asaas
            }
        };

        // 5. ENVIAR REQUISIÇÃO DE PAGAMENTO PARA O ASAAS
        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 
                'access_token': ASAAS_API_KEY, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentBody)
        });

        const paymentData = await paymentRes.json();

        // Se o Asaas retornar erro no pagamento
        if (paymentData.errors) {
            return res.status(400).json({ error: paymentData.errors[0].description });
        }

        // 6. RETORNO DE SUCESSO PARA O CHECKOUT.JS
        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl // URL da fatura que será aberta em nova aba
        });

    } catch (error) {
        console.error("Erro crítico na API:", error);
        return res.status(500).json({ error: "Erro interno no servidor ao processar o pagamento." });
    }
}

