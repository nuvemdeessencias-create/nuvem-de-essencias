export default async function handler(req, res) {
  // A Vercel já faz o parse do corpo da requisição automaticamente
  const { cep_destino, quantidade, valor_total } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;

  try {
    // --- 1. REGRA DE FRETE GRÁTIS POR VALOR ---
    if (valor_total >= 700) {
      return res.status(200).json([
        { name: "Frete Grátis (Promoção)", price: "0.00", delivery_time: "6-13" }
      ]);
    }

    // --- 2. REGRA PARA ARAGUAÍNA ---
    if (cep_destino && cep_destino.startsWith("778")) {
      return res.status(200).json([
        { name: "Entrega Local (Araguaína)", price: "0.00", delivery_time: "1" },
        { name: "Retirada no Local", price: "0.00", delivery_time: "0" }
      ]);
    }

    // --- 3. CÁLCULO COM CAIXA DEITADA (24x15x14) ---
    const pesoTotal = (quantidade || 1) * 0.7;
    const payload = {
      "from": { "postal_code": "77809270" },
      "to": { "postal_code": cep_destino },
      "products": [{
        "id": "perfumes-nuvem",
        "width": 15,   // largura
        "height": 14,  // altura
        "length": 24,  // comprimento (deitado)
        "weight": pesoTotal,
        "insurance_value": valor_total || 100,
        "quantity": 1
      }]
    };

    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Nuvem de Essencias (contato@nuvemdeessencias.com.br)'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno", mensagem: error.message });
  }
}
