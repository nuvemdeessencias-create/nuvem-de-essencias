/* SISTEMA DE PROMOÇÕES - NUVEM DE ESSÊNCIAS */

const configuracaoPromocoes = {
    ativo: true, // Chave mestre para ligar/desligar tudo

    // MODALIDADE POR ID (Prioridade Máxima)
    porId: {
        // --- TESTES ATIVOS (7%) ---
        "ckone": 0.07,
        "clubblack": 0.07,
        "sabah": 0.07,

        // --- LISTA COMPLETA (0 = Desativado) ---
        "fucsia": 0,
        "rojo": 0,
        "shakira-ama": 0,
        "chloe": 0,
        "gabriela": 0,
        "lady": 0,
        "invictus": 0,
        "diamond": 0,
        "animale-f": 0,
        "animale-m": 0,
        "silver": 0,
        "azahar": 0,
        "hugomen": 0,
        "blue": 0,
        "icon": 0,
        "power": 0,
        "azzaro": 0,
        "cool": 0,
        "nautica": 0,
        "bareeq": 0,
        "fakhar": 0,
        "asad-lattafa": 0,
        "kitamarillo": 0,
        "coffretfucsia": 0,
        "kitblue": 0
    },

    // MODALIDADE POR MARCA (Aplica a todos os itens da marca)
    porMarca: {
        // "SHAKIRA": 0.10  <-- Exemplo: se ativar aqui, todos da Shakira ganham 10%
    }
};

/**
 * Função Inteligente para processar o preço
 * Agora ela ignora maiúsculas/minúsculas automaticamente
 */
function processarPrecoProduto(p) {
    if (!configuracaoPromocoes.ativo) {
        return { precoFinal: p.preco, emPromocao: false, descontoPercentual: 0 };
    }

    let desconto = 0;
    const idBusca = p.id.toLowerCase();
    const marcaBusca = p.marca.toUpperCase();

    // 1. VERIFICA POR ID
    if (configuracaoPromocoes.porId[idBusca] && configuracaoPromocoes.porId[idBusca] > 0) {
        desconto = configuracaoPromocoes.porId[idBusca];
    } 
    // 2. VERIFICA POR MARCA (se não tiver desconto específico no ID)
    else if (configuracaoPromocoes.porMarca[marcaBusca] && configuracaoPromocoes.porMarca[marcaBusca] > 0) {
        desconto = configuracaoPromocoes.porMarca[marcaBusca];
    }

    if (desconto > 0) {
        return {
            precoFinal: p.preco * (1 - desconto),
            emPromocao: true,
            descontoPercentual: (desconto * 100).toFixed(0)
        };
    }

    return { precoFinal: p.preco, emPromocao: false, descontoPercentual: 0 };
}
