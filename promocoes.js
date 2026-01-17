/* SISTEMA DE PROMOÇÕES DINÂMICO - ATUALIZADO */

function processarPrecoProduto(dados) {
    // 1. Localiza o produto no array global do Firebase
    const p = window.meusProdutos ? window.meusProdutos.find(item => item.id === dados.id) : null;
    
    // 2. Se o produto não existe no banco, retorna preço padrão
    if (!p) {
        return { 
            emPromocao: false,
            precoOriginal: dados.preco,
            pixValor: dados.preco, 
            valor10x: dados.preco,
            maxParcelas: 10
        };
    }

    // 3. Pega as porcentagens do banco (Se não tiver nada, assume 0)
    const descPix = parseFloat(p.descPix) || 0; 
    const desc6x = parseFloat(p.desc6x) || 0;

    // 4. Verifica se existe algum desconto ativo
    const temPromo = descPix > 0 || desc6x > 0;

    if (!temPromo) {
        return { 
            emPromocao: false,
            precoOriginal: dados.preco,
            pixValor: dados.preco, 
            valor10x: dados.preco,
            maxParcelas: 10
        };
    }

    // 5. Cálculos dos valores com desconto
    const valorPix = dados.preco * (1 - descPix / 100);
    const valor6x = dados.preco * (1 - desc6x / 100);

    return {
        emPromocao: true,
        precoOriginal: dados.preco,
        pixValor: valorPix,
        pixPercentual: descPix,
        tem6x: desc6x > 0,
        valor6x: valor6x,
        parcela6x: valor6x / 6,
        percentual6x: desc6x,
        valor10x: dados.preco, // 10x continua sendo o preço cheio
        maxParcelas: 10
    };
}
