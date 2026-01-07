export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    // Pega a chave da Vercel (Ambiente Seguro)
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
    
    // Mude para 'https://www.asaas.com/api/v3' quando for para produção (dinheiro real)
    const ASAAS_URL = 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento } = req.body;

    try {
        // 1. CRIAR OU LOCALIZAR CLIENTE
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
        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo, 
            value: pagamento.valor, // Valor total (Produtos + Frete)
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Pedido Nuvem de Essências",
            externalReference: `PED-${Date.now()}`,
            postalService: false
        };

        // 3. ADICIONAR REGRAS DE PARCELAMENTO (Se não for PIX)
        if (pagamento.metodo !== 'PIX') {
            paymentBody.installmentCount = 1; // Começa selecionado em 1x
            paymentBody.totalFixedAmount = pagamento.valor; // Trava o valor para não ter juros
            
            // Define o máximo de parcelas (6 ou 10) que enviamos do checkout.js
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

        // 5. RETORNAR SUCESSO
        return res.status(200).json(paymentData);

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor", message: error.message });
    }
}
