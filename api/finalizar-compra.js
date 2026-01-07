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
                province: endereco.bairro
            })
        });

        const customerData = await customerRes.json();
        if (customerData.errors) return res.status(400).json({ error: "Erro no cliente", details: customerData.errors });

        // 2. CRIAR UMA COBRANÇA "UNDEFINED" (Gera um link de checkout)
        // Isso permite que o cliente escolha a forma de pagamento na tela do Asaas
        const paymentBody = {
            customer: customerData.id,
            billingType: 'UNDEFINED', // MÁGICA AQUI: Abre todas as opções (Pix, Cartão, Boleto)
            value: pagamento.valor,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`
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
            return res.status(400).json({ error: "Erro na cobrança", details: paymentData.errors });
        }

        // 3. RETORNAR O LINK PARA O SEU SITE REDIRECIONAR
        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl // Este é o link da página de pagamento
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro no servidor", message: error.message });
    }
}
