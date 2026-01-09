export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CRIAR OU LOCALIZAR CLIENTE
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
                postalCode: endereco.cep,
                address: endereco.rua,
                addressNumber: endereco.numero,
                province: endereco.bairro,
                notificationDisabled: true
            })
        });

        const customerData = await customerRes.json();
        if (customerData.errors) return res.status(400).json({ error: "Erro no cliente", details: customerData.errors });

        // 2. CONFIGURAR O TIPO DE PAGAMENTO DINÂMICO
        const ePix = pagamento.metodo === 'PIX';

        const paymentBody = {
            customer: customerData.id,
            // Se o método vindo do front for 'PIX', envia PIX. Caso contrário, CREDIT_CARD.
            billingType: ePix ? 'PIX' : 'CREDIT_CARD',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            
            // Lógica de valores e parcelas:
            // Se for PIX ou 1x no cartão, enviamos apenas o 'value'.
            // Se for parcelado, enviamos a contagem e o valor da parcela.
            ...(ePix || pagamento.parcelas <= 1 ? {
                value: pagamento.valor 
            } : {
                installmentCount: pagamento.parcelas,
                installmentValue: (pagamento.valor / pagamento.parcelas).toFixed(2)
            })
        };

        // 3. CRIAR A COBRANÇA NO ASAAS
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
                error: paymentData.errors[0].description, 
                details: paymentData.errors 
            });
        }

        // Retornamos a URL da fatura (que agora terá o QR Code se for PIX)
        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro no servidor", message: error.message });
    }
}
