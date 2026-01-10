export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CAPTURA A URL DINÂMICA (Para aceitar os links de Preview da Vercel)
        // O cabeçalho 'referer' nos diz exatamente em qual link de desenvolvimento você está.
        const referer = req.headers.referer || "https://nuvem-de-essencias.vercel.app";
        // Limpa a URL para remover barras ou parâmetros extras
        const urlFinal = referer.split('?')[0]; 

        // 2. CRIAR OU LOCALIZAR CLIENTE
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

        // 3. MONTAR O CORPO DO PAGAMENTO COM URL DINÂMICA
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
            value: pagamento.valor,
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            
            // O Asaas usa successUrl para criar o botão "Voltar para o site"
            successUrl: urlFinal, 
            
            // O callback garante que o Asaas aceite o redirecionamento
            callback: {
                url: urlFinal,
                autoRedirect: false // Mantém falso para o cliente ver o comprovante
            }
        };

        // 4. CRIAR O PAGAMENTO NO ASAAS
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
            return res.status(400).json({ 
                error: paymentData.errors[0].description 
            });
        }

        // 5. RETORNA A URL PARA O FRONTEND ABRIR
        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        console.error("Erro na API Asaas:", error);
        return res.status(500).json({ error: "Erro interno no servidor ao processar pagamento" });
    }
}
