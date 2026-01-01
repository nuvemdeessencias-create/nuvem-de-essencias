export default async function handler(req, res) {
  // Configuração de CORS para permitir que o seu site acesse a api sem bloqueios
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
    let opcoesPersonalizadas = [];

    // --- 1. REGRA DE FRETE GRÁTIS (Soma à lista, não para a execução) ---
    if (parseFloat(valor_total) >= 700) {
      opcoesPersonalizadas.push({ 
        name: "Frete Grátis (Promoção)", 
        price: 0, 
        delivery_time: "7 a 13",
        custom: true 
      });
    }

    // --- 2. REGRA PARA ARAGUAÍNA (Soma à lista) ---
    const cepLimpo = cep_destino ? cep_destino.replace(/\D/g, '') : "";
    if (cepLimpo.startsWith("778")) {
      opcoesPersonalizadas.push(
        { name: "Entrega em Casa (Araguaína)", price: 0, delivery_time: "Até 1 dia útil", custom: true },
        { name: "Retirada no Local", price: 0, delivery_time: "Imediato (Combinar)", custom: true }
      );
    }

    // --- 3. CÁLCULO MELHOR ENVIO (Sempre executa para mostrar as outras opções) ---
    const pesoTotal = (parseInt(quantidade) || 1) * 0.6;
    const payload = {
      "from": { "postal_code": "77809270" },
      "to": { "postal_code": cepLimpo },
      "package": { // Melhor usar 'package' para múltiplos itens
        "width": 15, "height": 14, "length": 24, "weight": pesoTotal
      },
      "options": {
        "insurance_value": parseFloat(valor_total) || 100, // SEGURO HABILITADO AQUI
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
        'User-Agent': 'Nuvem de Essencias (contato@nuvemdeessencias.com.br)'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Junta as opções do Melhor Envio com as suas personalizadas
    const todasOpcoes = Array.isArray(data) ? [...opcoesPersonalizadas, ...data] : opcoesPersonalizadas;
    
    return res.status(200).json(todasOpcoes);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno", mensagem: error.message });
  }
