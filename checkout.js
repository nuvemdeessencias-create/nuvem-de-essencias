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
    // 1. Verifica se a sacola está vazia
    if (typeof sacola === 'undefined' || sacola.length === 0) {
        return alert("Sua sacola está vazia!");
    }

    // 2. TRAVA DE SEGURANÇA: Verifica se o frete foi selecionado
    if (!nomeFreteGlobal || nomeFreteGlobal === "") {
        alert("⚠️ Por favor, calcule e SELECIONE uma opção de frete antes de finalizar!");
        // Se a sacola estiver fechada, abre ela para o cliente escolher o frete
        if (typeof toggleCart === "function") {
            const cartModal = document.getElementById('cart-modal');
            if (cartModal && !cartModal.classList.contains('active')) toggleCart();
        }
        return; 
    }
    
    // Fecha a sacola para mostrar o formulário de endereço
    if (typeof toggleCart === "function") {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.classList.contains('active')) toggleCart();
    }

    const dados = prepararDadosParaAsaas();
    const resumoDiv = document.getElementById('resumoValores');
    
    if (resumoDiv) {
        let blocoCartao = "";

        // LÓGICA DA PROMOÇÃO: Só mostra "6x com desc" se a promo estiver ativa
        if (dados.temPromo6xAtiva) {
            blocoCartao = `
                <p><strong>Total Cartão:</strong> R$ ${formatarMoeda(dados.valorTotalCartao6x + valorFreteGlobal)} (Até 6x c/ desc.)</p>
                <p style="font-size: 11px; color: #666;">*Opção de 10x sem desconto disponível no próximo passo.</p>
            `;
        } else {
            // Se NÃO tem promo, mostra o valor normal em até 10x
            blocoCartao = `
                <p><strong>Total Cartão:</strong> R$ ${formatarMoeda(dados.valorTotalOriginal + valorFreteGlobal)} (Até 10x sem juros)</p>
            `;
        }

        resumoDiv.innerHTML = `
            <div style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 5px;">
                <span style="color: #2e7d32; font-weight: bold;">🚚 Frete: ${nomeFreteGlobal}</span>
            </div>
            <p><strong>Total PIX:</strong> R$ ${formatarMoeda(dados.valorTotalPix + valorFreteGlobal)}</p>
            ${blocoCartao}
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
function coletarDadosCheckout(metodoPagamento, event) {
    const dadosCarrinho = prepararDadosParaAsaas();
    if (!dadosCarrinho) return alert("Seu carrinho está vazio!");

    // VALIDAÇÃO DE SEGURANÇA: Garante que o frete existe antes de enviar
    if (typeof valorFreteGlobal === 'undefined' || valorFreteGlobal === null) {
        return alert("Erro: Frete não identificado. Por favor, calcule o frete novamente.");
    }

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
            
            // SOMA O VALOR DO PRODUTO + VALOR DO FRETE
            valor: (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x) + valorFreteGlobal,
            parcelasMaximas: dadosCarrinho.temPromo6xAtiva ? 6 : 10,
            itens: dadosCarrinho.itensDetalhados
        }
    };

    // Validação básica de preenchimento
    if (!checkout.cliente.nome || checkout.cliente.cpfCnpj.length < 11 || !checkout.endereco.cep) {
        return alert("Por favor, preencha Nome, CPF e CEP corretamente.");
    }

    // FEEDBACK PARA O USUÁRIO (Botão Processando)
    const btnAcao = event.target; 
    const textoOriginal = btnAcao.innerText;
    btnAcao.innerText = "PROCESSANDO...";
    btnAcao.disabled = true;

    // ENVIO PARA A API NA VERCEL
    fetch('/api/finalizar-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkout)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok && data.invoiceUrl) {
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
