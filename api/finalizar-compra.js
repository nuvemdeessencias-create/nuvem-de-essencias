export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const isProduction = process.env.VERCEL_ENV === 'production';
    const ASAAS_API_KEY = isProduction ? process.env.ASAAS_API_KEY_PROD : process.env.ASAAS_API_KEY_SANDBOX;
    const ASAAS_URL = isProduction ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

    // 1. ADICIONE "metadata" aqui na desestruturação
    const { cliente, endereco, pagamento, metadata } = req.body;

    try {
        const referer = req.headers.referer || "https://nuvem-de-essencias.vercel.app";
        const urlDinamica = referer.split('?')[0];

        const customerRes = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: cliente.nome,
                email: cliente.email,
                cpfCnpj: cliente.cpfCnpj,
                mobilePhone: cliente.telefone,
                notificationDisabled: true
            })
        });

        const customerData = await customerRes.json();
        if (customerData.errors) return res.status(400).json({ error: customerData.errors[0].description });

        // 2. ADICIONE "metadata" dentro do paymentBody
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            value: pagamento.valor,
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            metadata: metadata, // <-- ESSA LINHA CONECTA TUDO
            callback: {
                successUrl: urlDinamica, 
                autoRedirect: false
            }
        };

        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentBody)
        });

        const paymentData = await paymentRes.json();
        if (paymentData.errors) return res.status(400).json({ error: paymentData.errors[0].description });

        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        console.error("Erro crítico na API:", error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
}
