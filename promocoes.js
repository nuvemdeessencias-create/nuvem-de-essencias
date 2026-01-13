/* SISTEMA DE PROMOÇÕES DINÂMICO - NUVEM DE ESSÊNCIAS */

function processarPrecoProduto(dados) {
    // 1. Localiza o produto no array global que o Firebase preencheu
    const p = window.meusProdutos ? window.meusProdutos.find(item => item.id === dados.id) : null;
    
    // 2. Se o produto não existe no banco ou o checkbox de promoção está desmarcado
    if (!p || !p.promoAtiva) {
        return { 
            emPromocao: false,
            precoOriginal: dados.preco,
            pixValor: dados.preco, 
            valor10x: dados.preco,
            tem6x: false,
            maxParcelas: 10
        };
    }

    // 3. Pega as porcentagens do banco (se não existirem, usa o padrão: 15% PIX e 6% no 6x)
    const descPix = p.descPix || 15; 
    const desc6x = p.desc6x || 6;

    // 4. Cálculos dos valores com desconto
    const valorPix = dados.preco * (1 - descPix / 100);
    const valor6x = dados.preco * (1 - desc6x / 100);

    return {
        emPromocao: true,
        precoOriginal: dados.preco,
        pixValor: valorPix,
        pixPercentual: descPix,
        tem6x: true,
        valor6x: valor6x,
        parcela6x: valor6x / 6,
        percentual6x: desc6x,
        valor10x: dados.preco,
        maxParcelas: 10
    };
}
