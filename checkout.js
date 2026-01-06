function prepararDadosParaAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) return null;
    
    let dados = {
        valorTotalPix: 0,
        valorTotalCartao6x: 0, // Soma de itens com 6% OFF + itens normais (preço cheio)
        valorTotalOriginal: 0, // Valor para quem quer pagar em 10x sem descontos
        temPromo6xAtiva: false,
        itensDetalhados: []
    };

    sacola.forEach(item => {
        const p = meusProdutos.find(prod => prod.id === item.id);
        const precoOriginal = item.preco; 
        const infoPromo = processarPrecoProduto({ id: item.id, ml: item.ml, preco: precoOriginal });

        // 1. Soma do PIX (Independente para cada item)
        dados.valorTotalPix += infoPromo.pixValor * item.qtd;

        // 2. Soma do Cartão (Cenário 6x)
        if (infoPromo.tem6x) {
            dados.temPromo6xAtiva = true;
            dados.valorTotalCartao6x += infoPromo.valor6x * item.qtd;
        } else {
            // Se o item não tem promo 6x, entra com valor original na conta de 6x
            dados.valorTotalCartao6x += precoOriginal * item.qtd;
        }

        // 3. Soma do Valor Original (Cenário 10x)
        dados.valorTotalOriginal += precoOriginal * item.qtd;
        
        dados.itensDetalhados.push({ 
            nome: p.nome, 
            quantidade: item.qtd, 
            precoUnitario: precoOriginal 
        });
    });

    return dados;
}
function abrirCheckoutAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) {
        return alert("Sua sacola está vazia!");
    }
    
    // Fecha o modal da sacola se a função toggleCart existir
    if (typeof toggleCart === "function") toggleCart();

    const dados = prepararDadosParaAsaas();
    const resumoDiv = document.getElementById('resumoValores');
    
    if (resumoDiv) {
        resumoDiv.innerHTML = `
            <p><strong>Total PIX:</strong> R$ ${formatarMoeda(dados.valorTotalPix)}</p>
            <p><strong>Total Cartão:</strong> R$ ${formatarMoeda(dados.valorTotalCartao6x)} (Até 6x c/ desc.)</p>
            <p style="font-size: 11px; color: #666;">*Opção de 10x sem desconto disponível no próximo passo.</p>
        `;
    }
    
    const modalCheckout = document.getElementById('modalCheckout');
    if (modalCheckout) modalCheckout.style.display = 'flex';
}

function buscarCEP(cep) {
    const valor = cep.replace(/\D/g, '');
    if (valor.length !== 8) return;
    
    fetch(`https://viacep.com.br/ws/${valor}/json/`)
        .then(res => res.json())
        .then(dados => {
            if (!dados.erro) {
                document.getElementById('end_rua').value = dados.logradouro;
                document.getElementById('end_bairro').value = dados.bairro;
                document.getElementById('end_cidade').value = dados.localidade;
                document.getElementById('end_estado').value = dados.uf;
                document.getElementById('end_numero').focus();
            }
        })
        .catch(err => console.error("Erro ao buscar CEP", err));
}

function coletarDadosCheckout(metodoPagamento) {
    const dadosCarrinho = prepararDadosParaAsaas();
    if (!dadosCarrinho) return alert("Seu carrinho está vazio!");

    const checkout = {
        cliente: {
            nome: document.getElementById('cliente_nome').value,
            email: document.getElementById('cliente_email').value,
            cpfCnpj: document.getElementById('cliente_cpf').value.replace(/\D/g, ''),
            telefone: document.getElementById('cliente_celular').value.replace(/\D/g, '')
        },
        endereco: {
            cep: document.getElementById('end_cep').value.replace(/\D/g, ''),
            rua: document.getElementById('end_rua').value,
            numero: document.getElementById('end_numero').value,
            bairro: document.getElementById('end_bairro').value,
            cidade: document.getElementById('end_cidade').value,
            estado: document.getElementById('end_estado').value
        },
        pagamento: {
            metodo: metodoPagamento,
            valor: metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x
        }
    };

    if (!checkout.cliente.nome || !checkout.cliente.cpfCnpj || !checkout.endereco.cep) {
        return alert("Preencha Nome, CPF e CEP corretamente.");
    }
    
    console.log("Enviando para o Backend/Asaas:", checkout);
    alert("Dados validados! O pedido será processado.");
}
