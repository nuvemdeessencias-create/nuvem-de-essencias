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

    if (!nomeFreteGlobal || nomeFreteGlobal === "") {
        alert("⚠️ Por favor, calcule e SELECIONE uma opção de frete antes de finalizar!");
        if (typeof toggleCart === "function") {
            const cartModal = document.getElementById('cart-modal');
            if (cartModal && !cartModal.classList.contains('active')) toggleCart();
        }
        return; 
    }
    
    if (typeof toggleCart === "function") {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && cartModal.classList.contains('active')) toggleCart();
    }

    const dados = prepararDadosParaAsaas();
    const resumoDiv = document.getElementById('resumoValores');
    
    if (resumoDiv) {
        let blocoCartao = "";

        if (dados.temPromo6xAtiva) {
            blocoCartao = `
                <p><strong>Total Cartão:</strong> R$ ${formatarMoeda(dados.valorTotalCartao6x + valorFreteGlobal)} (Até 6x c/ desc.)</p>
                <p style="font-size: 11px; color: #666;">*Opção de 10x sem desconto disponível no próximo passo.</p>
            `;
        } else {
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

function coletarDadosCheckout(metodoPagamento, event) {
    const dadosCarrinho = prepararDadosParaAsaas();
    if (!dadosCarrinho) return alert("Seu carrinho está vazio!");

    if (typeof valorFreteGlobal === 'undefined' || valorFreteGlobal === null) {
        return alert("Erro: Frete não identificado. Por favor, calcule o frete novamente.");
    }

    // --- AJUSTE DE SEGURANÇA: VALIDAÇÃO DO NOME COMPLETO ---
    const nomeInput = document.getElementById('cliente_nome').value.trim();
    if (nomeInput.split(' ').length < 2) {
        return alert("⚠️ Por favor, digite seu NOME COMPLETO (nome e sobrenome). O sistema de pagamento exige isso para validar seu CPF.");
    }

    const checkout = {
        cliente: {
            nome: nomeInput,
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
       // No seu checkout.js
pagamento: {
    método: métodoPagamento,
    valor: (métodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x) + valorFreteGlobal, // Mude de 'valentia' para 'valor'
    parcelasMaximas: dadosCarrinho.temPromo6xAtiva ? 6 : 10,
    itens: dadosCarrinho.itensDetalhes
}

    if (!checkout.cliente.nome || checkout.cliente.cpfCnpj.length < 11 || !checkout.endereco.cep) {
        return alert("Por favor, preencha Nome, CPF e CEP corretamente.");
    }

    const btnAcao = event.target; 
    const textoOriginal = btnAcao.innerText;
    btnAcao.innerText = "PROCESSANDO...";
    btnAcao.disabled = true;

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
            // Melhora a exibição do erro para o usuário
            const msgErro = data.details ? data.details[0].description : (data.error || "Erro ao processar");
            throw new Error(msgErro);
        }
    })
    .catch(err => {
        console.error("Erro:", err);
        alert("Falha: " + err.message);
        btnAcao.innerText = textoOriginal;
        btnAcao.disabled = false;
    });
}
