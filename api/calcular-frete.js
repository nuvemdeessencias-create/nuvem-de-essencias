export default async function handler(req, res) {
  // Configuração de CORS para permitir que o seu site acesse a API sem bloqueios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde rapidamente a requisições de verificação do navegador
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { cep_destino, quantidade, valor_total } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;

  try {
    // --- 1. REGRA DE FRETE GRÁTIS POR VALOR ---
    if (parseFloat(valor_total) >= 700) {
      return res.status(200).json([
        { name: "Frete Grátis (Promoção)", price: 0, delivery_time: "6-13" }
      ]);
    }

    // --- 2. REGRA PARA ARAGUAÍNA ---
    if (cep_destino && (cep_destino.startsWith("778") || cep_destino.startsWith("7780"))) {
      return res.status(200).json([
        { name: "Entrega Local (Araguaína)", price: 0, delivery_time: "1" },
        { name: "Retirada no Local", price: 0, delivery_time: "0" }
      ]);
    }

    // --- 3. CÁLCULO MELHOR ENVIO ---
    const pesoTotal = (parseInt(quantidade) || 1) * 0.7;
    const payload = {
      "from": { "postal_code": "77809270" },
      "to": { "postal_code": cep_destino },
      "products": [{
        "id": "perfumes-nuvem",
        "width": 15, "height": 14, "length": 24,
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
    return res.status(200).json(Array.isArray(data) ? data : []);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno", mensagem: error.message });
  }
}
