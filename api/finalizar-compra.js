export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CRIAR CLIENTE
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
        if (customerData.errors) return res.status(400).json({ error: customerData.errors[0].description });

        // 2. CRIAR PAGAMENTO COM A URL CORRETA
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            value: pagamento.valor,
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            
            // AQUI ESTÁ A CORREÇÃO:
            // O Asaas as vezes pede successUrl fora do callback em algumas requisições v3
            // E dentro do callback para outras. Vamos enviar nos dois para garantir!
            
            callback: {
                url: "https://nuvem-de-essencias.vercel.app",
                autoRedirect: false
            }
        };

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
            // Se o erro de successUrl persistir, o Asaas retornará aqui
            return res.status(400).json({ 
                error: paymentData.errors[0].description 
            });
        }

        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}
