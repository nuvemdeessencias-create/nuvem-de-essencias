export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // Chave de API configurada nas Variáveis de Ambiente da Vercel
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    
    // URL de Sandbox para testes.
    const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CRIAR OU LOCALIZAR CLIENTE NO ASAAS
        const customerRes = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 
                'access_token': ASAAS_API_KEY, 
                'Content-Type': 'application/json',
                'User-Agent': 'NuvemDeEssencias'
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
                notificationDisabled: false
            })
        });

        const customerData = await customerRes.json();

        if (customerData.errors) {
            return res.status(400).json({ error: "Erro no cadastro do cliente", details: customerData.errors });
        }

        // 2. PREPARAR O CORPO DA COBRANÇA
        // O Asaas exige o campo 'value' na raiz para calcular as parcelas
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            value: pagamento.valor, 
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            postalService: false
        };

        // 3. REGRAS DE PARCELAMENTO (Se for Cartão)
        // Adicionando explicitamente o installmentCount para evitar o erro de 'valor da parcela'
        if (pagamento.metodo !== 'PIX') {
            paymentBody.installmentCount = 1; 
            paymentBody.totalFixedAmount = pagamento.valor;
            
            paymentBody.installmentOptions = {
                maxInstallmentCount: pagamento.parcelasMaximas || 10,
                unlimitedInstallments: false
            };
        }

        // 4. GERAR A COBRANÇA NO ASAAS
        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 
                'access_token': ASAAS_API_KEY, 
                'Content-Type': 'application/json',
                'User-Agent': 'NuvemDeEssencias'
            },
            body: JSON.stringify(paymentBody)
        });

        const paymentData = await paymentRes.json();

        if (paymentData.errors) {
            // Se houver erro, retornamos o primeiro erro detalhado do Asaas
            const msg = paymentData.errors[0].description || "Erro ao gerar cobrança";
            return res.status(400).json({ error: msg, details: paymentData.errors });
        }

        // 5. RETORNAR SUCESSO
        return res.status(200).json(paymentData);

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor", message: error.message });
    }
}
