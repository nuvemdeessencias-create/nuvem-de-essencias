export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // 1. CONFIGURAÇÃO DE AMBIENTE (DINÂMICA)
    // Verifica se estamos no ambiente de produção oficial da Vercel
    const isProduction = process.env.VERCEL_ENV === 'production';
    
    // Seleciona a chave e a URL com base no ambiente
    const ASAAS_API_KEY = isProduction 
        ? process.env.ASAAS_API_KEY_PROD  
        : process.env.ASAAS_API_KEY_SANDBOX;

    const ASAAS_URL = isProduction 
        ? 'https://www.asaas.com/api/v3'       
        : 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 2. LOGICA DE URL PARA O BOTÃO "IR PARA O SITE"
        // Captura o link de onde o usuário está acessando no momento
        const referer = req.headers.referer || "https://nuvem-de-essencias.vercel.app";
        const urlDinamica = referer.split('?')[0];

        // 3. CRIAR OU LOCALIZAR CLIENTE
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
        if (customerData.errors) {
            return res.status(400).json({ error: customerData.errors[0].description });
        }

        // 4. MONTAR CORPO DO PAGAMENTO (CONFORME DOCUMENTAÇÃO ASAAS V3)
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vencimento amanhã
            value: pagamento.valor,
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            
            // Objeto de callback para habilitar o botão de retorno
            callback: {
                successUrl: urlDinamica, 
                autoRedirect: false      // Exibe o botão "Ir para o site" após pagar
            }
        };

        // 5. ENVIAR REQUISIÇÃO DE PAGAMENTO
        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 
                'access_token': ASAAS_API_KEY, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentBody)
        });

        const paymentData = await paymentRes.json();

        if (paymentData.errors) {
            return res.status(400).json({ error: paymentData.errors[0].description });
        }

        // 6. RETORNO DE SUCESSO
        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        console.error("Erro interno:", error);
        return res.status(500).json({ error: "Erro interno no servidor ao processar o pagamento." });
    }
}
