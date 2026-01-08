/* --- checkout.js CORRIGIDO E COMPLETO --- */

// 1. FUNÇÃO DE BUSCA AUTOMÁTICA DE CEP
function buscarCEP(cep) {
    const valor = cep.replace(/\D/g, ''); // Remove tudo que não é número
    if (valor.length !== 8) return; // Só dispara a busca com 8 dígitos

    // Busca os dados na API ViaCEP
    fetch(`https://viacep.com.br/ws/${valor}/json/`)
        .then(res => res.json())
        .then(dados => {
            if (!dados.erro) {
                // Preenche os campos do formulário automaticamente
                document.getElementById('end_rua').value = dados.logradouro || "";
                document.getElementById('end_bairro').value = dados.bairro || "";
                document.getElementById('end_cidade').value = dados.localidade || "";
                document.getElementById('end_estado').value = dados.uf || "";
                
                // Move o cursor automaticamente para o campo número
                document.getElementById('end_numero').focus();
            } else {
                alert("CEP não encontrado. Por favor, preencha manualmente.");
            }
        })
        .catch(err => console.error("Erro ao buscar CEP:", err));
}

// 2. FUNÇÃO PARA PREPARAR OS DADOS DO CARRINHO
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

// 3. FUNÇÃO PARA ABRIR O MODAL DE PAGAMENTO
function abrirCheckoutAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) {
        return alert("Sua sacola está vazia!");
    }

    if (!nomeFreteGlobal) {
        return alert("⚠️ Selecione o frete antes de finalizar!");
    }

    const dados = prepararDadosParaAsaas();
    const modalCheckout = document.getElementById('modalCheckout');
    if (modalCheckout) modalCheckout.style.display = 'flex';
}

// 4. FUNÇÃO PARA COLETAR DADOS E ENVIAR PARA A API (VERSÃO COM ESCOLHA DE PARCELAS)
function coletarDadosCheckout(metodoPagamento, event) {
    const dadosCarrinho = prepararDadosParaAsaas();
    const nomeInput = document.getElementById('cliente_nome').value.trim();

    if (nomeInput.split(' ').length < 2) {
        return alert("⚠️ Por favor, digite seu NOME COMPLETO.");
    }

    // --- NOVIDADE AQUI: PERGUNTA AS PARCELAS SE FOR CARTÃO ---
    let parcelasEscolhidas = 1;
    const limiteParcelas = dadosCarrinho.temPromo6xAtiva ? 6 : 10;

    if (metodoPagamento === 'CREDIT_CARD') {
        const escolha = prompt(`Em quantas vezes deseja parcelar? (1 a ${limiteParcelas}x)`);
        parcelasEscolhidas = parseInt(escolha);

        if (isNaN(parcelasEscolhidas) || parcelasEscolhidas < 1 || parcelasEscolhidas > limiteParcelas) {
            return alert(`Por favor, escolha um número de 1 a ${limiteParcelas}.`);
        }
    }
    // -------------------------------------------------------

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
        pagamento: {
            metodo: metodoPagamento,
            valor: (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x) + valorFreteGlobal,
            parcelas: parcelasEscolhidas, // ENVIAMOS A ESCOLHA DO CLIENTE
            parcelasMaximas: limiteParcelas,
            itens: dadosCarrinho.itensDetalhados
        }
    };

    if (checkout.cliente.cpfCnpj.length < 11) {
        return alert("CPF inválido.");
    }

    const btnAcao = event.target; 
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
            throw new Error(data.error || "Erro no processamento");
        }
    })
    .catch(err => {
        alert("Falha: " + err.message);
        btnAcao.innerText = "FINALIZAR PAGAMENTO";
        btnAcao.disabled = false;
    });
}
