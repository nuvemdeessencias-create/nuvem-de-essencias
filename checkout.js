/* --- checkout.js --- */

function prepararDadosParaAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) return null;
    
    let dados = {
        valorTotalPix: 0,
        valorTotalCartao6x: 0,
        valorTotalOriginal: 0,
        temPromo6xAtiva: false,
        itensDetalhados: []
    };

    sacola.forEach(item => {
        const p = meusProdutos.find(prod => prod.id === item.id);
        const precoOriginal = item.preco; 
        const infoPromo = processarPrecoProduto({ id: item.id, ml: item.ml, preco: precoOriginal });

        dados.valorTotalPix += infoPromo.pixValor * item.qtd;

        if (infoPromo.tem6x) {
            dados.temPromo6xAtiva = true;
            dados.valorTotalCartao6x += infoPromo.valor6x * item.qtd;
        } else {
            dados.valorTotalCartao6x += precoOriginal * item.qtd;
        }

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
                document.getElementById('end_rua').value = dados.logradouro || "";
                document.getElementById('end_bairro').value = dados.bairro || "";
                document.getElementById('end_cidade').value = dados.localidade || "";
                document.getElementById('end_estado').value = dados.uf || "";
                document.getElementById('end_numero').focus();
            }
        })
        .catch(err => console.error("Erro ao buscar CEP", err));
}

// ESTA FUNÇÃO AGORA CONECTA COM A VERCEL
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
            metodo: metodoPagamento, // 'PIX' ou 'CREDIT_CARD'
            // Se for cartão, ele usa o valorTotalCartao6x calculado na função anterior
            valor: metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x,
            itens: dadosCarrinho.itensDetalhados
        }
    };

    // Validação básica
    if (!checkout.cliente.nome || checkout.cliente.cpfCnpj.length < 11 || !checkout.endereco.cep) {
        return alert("Por favor, preencha Nome, CPF e CEP corretamente.");
    }

    // FEEDBACK PARA O USUÁRIO
    const btnAcao = event.target; // Captura o botão clicado
    const textoOriginal = btnAcao.innerText;
    btnAcao.innerText = "PROCESSANDO...";
    btnAcao.disabled = true;

    // CHAMADA PARA A API NA VERCEL
    fetch('/api/finalizar-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkout)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok && data.invoiceUrl) {
            // REDIRECIONA PARA O PAGAMENTO
            window.location.href = data.invoiceUrl;
        } else {
            throw new Error(data.error || "Erro ao processar pagamento");
        }
    })
    .catch(err => {
        console.error("Erro:", err);
        alert("Falha: " + err.message);
        btnAcao.innerText = textoOriginal;
        btnAcao.disabled = false;
    });
}
