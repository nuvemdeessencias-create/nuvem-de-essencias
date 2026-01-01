export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { cep_destino, valor_total } = req.body;

    try {
        // Regra de Frete Grátis
        if (parseFloat(valor_total) >= 700) {
            return res.status(200).json([{
                name: "Frete Grátis",
                price: 0,
                delivery_time: "6 a 13"
            }]);
        }

        // Se não for grátis, aqui você conectaria com a Melhor Envio ou Correios
        // Por enquanto, vamos retornar um valor fixo para teste
        return res.status(200).json([{
            name: "Entrega Padrão",
            price: 25.00,
            delivery_time: "7 a 10"
        }]);

    } catch (error) {
        return res.status(500).json({ error: "Erro interno" });
    }
}
