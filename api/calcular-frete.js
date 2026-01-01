export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { cep_destino, quantidade, valor_total } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  // LIMPEZA CRUCIAL: Remove traços e espaços do CEP
  const cepLimpo = cep_destino ? cep_destino.replace(/\D/g, '') : "";
  const valorNum = parseFloat(valor_total) || 0;

  try {
    let opcoesFinais = [];

    // 1. REGRA ARAGUAÍNA (Verifica se começa com 778)
    if (cepLimpo.startsWith("778")) {
      opcoesFinais.push(
        { name: "Entrega Local (Araguaína)", price: 0, delivery_time: "Até 1 dia útil", custom: true },
        { name: "Retirada no Local", price: 0, delivery_time: "Imediato", custom: true }
      );
    }

    // 2. REGRA FRETE GRÁTIS (Se valor >= 700)
    if (valorNum >= 700) {
      opcoesFinais.push({ 
        name: "Frete Grátis (Promoção)", 
        price: 0, 
        delivery_time: "7 a 13", 
        custom: true 
      });
    }

    // 3. BUSCA NO MELHOR ENVIO
    if (cepLimpo.length === 8) {
      const pesoTotal = (parseInt(quantidade) || 1) * 0.7;
      const payload = {
        "from": { "postal_code": "77809270" },
        "to": { "postal_code": cepLimpo },
        "package": { 
          "width": 15, "height": 14, "length": 24, "weight": pesoTotal 
        },
        "options": { 
          "insurance_value": valorNum, 
          "receipt": false, 
          "own_hand": false 
        }
      };

      const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'Nuvem de Essencias'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filtra transportadoras válidas e junta com as personalizadas
          const transportadoras = data.filter(op => op.price && !op.error);
          opcoesFinais = [...opcoesFinais, ...transportadoras];
        }
      }
    }

    return res.status(200).json(opcoesFinais);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao calcular", details: error.message });
  }
}
