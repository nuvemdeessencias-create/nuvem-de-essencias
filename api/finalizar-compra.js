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

        // 2. CRIAR A COBRANÇA
        // REMOVEMOS o installmentCount aqui para o Asaas não tentar processar como cobrança única imediata

       // DENTRO DE api/finalizar-compra.js
// Substitua o bloco do paymentBody na sua API por este:
const paymentBody = {
    customer: customerData.id,
    const paymentBody = {
    customer: customerData.id,
    billingType: 'CREDIT_CARD', // Mudamos para CREDIT_CARD para forçar a abertura do formulário com parcelas
    value: pagamento.valor, 
    totalValue: pagamento.valor, // ADICIONADO: Obrigatório para validar parcelamento
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    description: "Pedido Nuvem de Essências",
    externalReference: `PED-${Date.now()}`,
    
    // A CONFIGURAÇÃO QUE LIBERA O SELETOR
    installmentCount: 1, // Começa exibindo o valor de 1x
    installmentOptions: {
        maxInstallmentCount: pagamento.parcelasMaximas || 10, // Respeita os 6x ou 10x do seu site
        unlimitedInstallments: false
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
            // Se o Asaas der erro, enviamos a descrição exata do erro para o seu alert no site
            return res.status(400).json({ 
                error: paymentData.errors[0].description, 
                details: paymentData.errors 
            });
        }

        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro no servidor", message: error.message });
    }
}
