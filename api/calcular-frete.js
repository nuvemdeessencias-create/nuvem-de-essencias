export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Captura os dados garantindo que o valor seja número
  const { cep_destino, valor_total } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  const cepLimpo = cep_destino ? cep_destino.replace(/\D/g, '') : "";
  // Arredonda para 2 casas decimais para não travar a API
  const valorNum = parseFloat(parseFloat(valor_total || 0).toFixed(2));

  try {
    let opcoesFinais = [];

    // 2. REGRA ARAGUAÍNA (Sempre funciona)
    if (cepLimpo.startsWith("778")) {
      opcoesFinais.push(
        { name: "Entrega Local (Araguaína)", price: 10.00, delivery_time: "1" },
        { name: "Retirada no Local", price: 0, delivery_time: "0" }
      );
      // Se for Araguaína, já podemos retornar aqui ou continuar para somar outras opções
      return res.status(200).json(opcoesFinais);
    }

    // 3. BUSCA NO MELHOR ENVIO (Fora de Araguaína)
    if (cepLimpo.length === 8) {
      // Calculamos o peso aproximado baseado no valor se a quantidade não vier
      const pesoTotal = 0.6; 

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
          const transportadoras = data
            .filter(op => op.price && !op.error)
            .map(op => ({
              name: op.name,
              price: parseFloat(op.price),
              delivery_time: op.delivery_range ? `${op.delivery_range.min}-${op.delivery_range.max}` : op.delivery_time
            }));
          
          opcoesFinais = [...opcoesFinais, ...transportadoras];
        }
      }
    }

    // 4. REGRA FRETE GRÁTIS (Adiciona ao final se atingir o valor)
    // Nota: Verifique se quer oferecer frete grátis mesmo em itens promocionais
    if (valorNum >= 700) {
       opcoesFinais.unshift({ 
         name: "Frete Grátis (Promocional)", 
         price: 0, 
         delivery_time: "8 a 14" 
       });
    }

    return res.status(200).json(opcoesFinais);

  } catch (error) {
    console.error("Erro interno API:", error);
    return res.status(500).json({ error: "Erro ao calcular", details: error.message });
  }
}
