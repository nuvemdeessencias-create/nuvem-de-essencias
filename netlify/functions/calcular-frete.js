exports.handler = async (event) => {
  try {
    const { cep_destino, quantidade, valor_total } = JSON.parse(event.body);
    const token = process.env.MELHOR_ENVIO_TOKEN;

    // --- 1. REGRA DE FRETE GRÁTIS POR VALOR ---
    if (valor_total >= 700) {
       return {
         statusCode: 200,
         body: JSON.stringify([{ name: "Frete Grátis (Promoção)", price: "0.00", delivery_time: "6-13" }])
       };
    }

    // --- 2. REGRA PARA ARAGUAÍNA ---
    if (cep_destino.startsWith("778")) {
       return {
         statusCode: 200,
         body: JSON.stringify([
           { name: "Entrega Local (Araguaína)", price: "0.00", delivery_time: "1" },
           { name: "Retirada no Local", price: "0.00", delivery_time: "0" }
         ])
       };
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Erro interno", mensagem: error.message }) 
    };
  }
};
