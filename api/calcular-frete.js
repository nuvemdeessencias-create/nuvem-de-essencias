export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ADICIONADO: tem_promo vindo do corpo da requisição
  const { cep_destino, valor_total, tem_promo } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  const cepLimpo = cep_destino ? cep_destino.replace(/\D/g, '') : "";
  const valorNum = parseFloat(parseFloat(valor_total || 0).toFixed(2));

  try {
    let opcoesFinais = [];

    // 1. REGRA ARAGUAÍNA (Mantida igual)
    if (cepLimpo.startsWith("778")) {
      return res.status(200).json([
        { name: "Entrega Local (Araguaína)", price: 10.00, delivery_time: "1" },
        { name: "Retirada no Local", price: 0, delivery_time: "0" }
      ]);
    }

    // 2. BUSCA NO MELHOR ENVIO
    if (cepLimpo.length === 8) {
      const payload = {
        "from": { "postal_code": "77809270" },
        "to": { "postal_code": cepLimpo },
        "package": { "width": 15, "height": 14, "length": 24, "weight": 0.6 },
        "options": { "insurance_value": valorNum, "receipt": false, "own_hand": false }
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
          opcoesFinais = data
            .filter(op => op.price && !op.error)
            .map(op => ({
              name: op.name,
              price: parseFloat(op.price),
              delivery_time: op.delivery_range ? `${op.delivery_range.min}-${op.delivery_range.max}` : op.delivery_time
            }));
        }
      }
    }

    // 3. NOVA LÓGICA DE FRETE GRÁTIS VS PROMOÇÃO
    // Se NÃO tem promoção E o valor é >= 700, limpa tudo e deixa só o GRÁTIS
    if (!tem_promo && valorNum >= 700) {
      const maiorPrazo = opcoesFinais.length > 0 ? "8 a 17" : "10 a 15"; 
      return res.status(200).json([{ 
        name: "Frete Grátis (Promocional)", 
        price: 0, 
        delivery_time: maiorPrazo 
      }]);
    }

    // Se TIVER promoção ou valor < 700, retorna as opções pagas (PAC/SEDEX) encontradas
    return res.status(200).json(opcoesFinais);

  } catch (error) {
    return res.status(500).json({ error: "Erro ao calcular", details: error.message });
  }
}
