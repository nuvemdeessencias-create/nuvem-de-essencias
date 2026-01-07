export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // Chave de API configurada nas Variáveis de Ambiente da Vercel
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    
    // URL de Sandbox para testes. Mude para 'https://www.asaas.com/api/v3' em produção.
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

        // 2. PREPARAR O CORPO DA COBRANÇA (Básico)
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo, // 'PIX' ou 'CREDIT_CARD'
            value: pagamento.valor, // Valor total enviado pelo checkout.js
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Vencimento em 24h
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            postalService: false
        };

        // 3. REGRAS ESPECÍFICAS PARA CARTÃO (Evita erro de valor da parcela)
        if (pagamento.metodo !== 'PIX') {
            paymentBody.installmentCount = 1; // Define cobrança inicial como 1x (Obrigatório)
            paymentBody.totalFixedAmount = pagamento.valor; // Trava o valor para não mudar com parcelas
            
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
            return res.status(400).json({ error: "Erro ao gerar cobrança", details: paymentData.errors });
        }

        // 5. RETORNAR SUCESSO (Inclui a invoiceUrl para o redirecionamento)
        return res.status(200).json(paymentData);

    } catch (error) {
        console.error("Erro Interno:", error);
        return res.status(500).json({ error: "Erro interno no servidor", message: error.message });
    }
}
