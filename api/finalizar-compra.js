// api/finalizar-compra.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // COLOQUE SUA CHAVE DO ASAAS AQUI (Use o Sandbox para testes)
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CRIAR OU LOCALIZAR CLIENTE
        const customerRes = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: cliente.nome,
                email: cliente.email,
                cpfCnpj: cliente.cpfCnpj,
                mobilePhone: cliente.telefone,
                postalCode: endereco.cep,
                address: endereco.rua,
                addressNumber: endereco.numero,
                province: endereco.bairro,
                notificationDisabled: false
            })
        });
        const customerData = await customerRes.json();

        // 2. CRIAR A COBRANÇA (PIX OU CARTÃO)
        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: customerData.id,
                billingType: pagamento.metodo, // 'PIX' ou 'CREDIT_CARD'
                value: pagamento.valor,
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vence amanhã
                installmentCount: pagamento.parcelasMaximas || 1,
                description: "Pedido Nuvem de Essências"
            })
        });
        const paymentData = await paymentRes.json();

        // 3. RETORNAR SUCESSO
        return res.status(200).json(paymentData);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
