/* SISTEMA DE PROMOÇÕES - NUVEM DE ESSÊNCIAS */

const configuracaoPromocoes = {
    ativo: true,            // Chave Mestre: Desliga TUDO (Pix, 6x, etc)
    permitir6xGlobal: true, // Chave Global para a modalidade 6x

    porId: {
        // --- PROMOÇÃO ATIVA (CK ONE) ---
        "ckone": {
            ativa: true,
            descontoPix: 0.15,    // 15% de desconto no Pix
            permite10x: true,     // Ativa 10x sem juros valor original
            promo6x: { 
                ativo: true,      // ATIVO apenas para o CK ONE por enquanto
                desconto: 0.06,   // 6% de desconto
                maxParcelas: 6 
            }
        },

        // --- CATALOGO (6x DESATIVADO - Mude 'ativa' para true quando quiser ligar) ---
        "clubblack": { ativa: false, descontoPix: 0.07, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "sabah": { ativa: false, descontoPix: 0.07, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "fucsia": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "rojo": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "shakira-ama": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "chloe": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "gabriela": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "lady": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "invictus": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "diamond": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "animale-f": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "animale-m": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "silver": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "azahar": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "hugomen": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "blue": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "icon": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "power": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "azzaro": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "cool": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "nautica": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "bareeq": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "fakhar": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "asad-lattafa": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "kitamarillo": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "coffretfucsia": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "kitblue": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        
        // --- BATONS E VELAS ---
        "batom-fucsia": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } },
        "vela-lavanda": { ativa: false, descontoPix: 0.15, permite10x: true, promo6x: { ativo: false, desconto: 0.06, maxParcelas: 6 } }
    }
};

function processarPrecoProduto(p) {
    const idBusca = p.id.toLowerCase();
    const promo = configuracaoPromocoes.porId[idBusca];

    if (!configuracaoPromocoes.ativo || !promo || !promo.ativa) {
        return { 
            emPromocao: false,
            precoOriginal: p.preco,
            pixValor: p.preco,
            valor10x: p.preco,
            maxParcelas: 10
        };
    }

    const permite6x = configuracaoPromocoes.permitir6xGlobal && promo.promo6x && promo.promo6x.ativo;
    
    return {
        emPromocao: true,
        precoOriginal: p.preco,
        pixValor: p.preco * (1 - promo.descontoPix),
        pixPercentual: Math.round(promo.descontoPix * 100),
        tem6x: permite6x,
        valor6x: permite6x ? p.preco * (1 - promo.promo6x.desconto) : p.preco,
        percentual6x: permite6x ? Math.round(promo.promo6x.desconto * 100) : 0,
        valor10x: p.preco,
        maxParcelas: 10
    };
}
