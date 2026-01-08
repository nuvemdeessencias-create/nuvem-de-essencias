/* --- checkout.js TOTALMENTE CORRIGIDO --- */

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
            } else {
                alert("CEP não encontrado.");
            }
        })
        .catch(err => console.error("Erro ao buscar CEP:", err));
}

function prepararDadosParaAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) return null;
    
    let dados = {
        valorTotalPix: 0,
        valorTotalCartao6x: 0,
        valorTotalOriginal: 0,
        itensDetalhados: []
    };

    sacola.forEach(item => {
        const p = meusProdutos.find(prod => prod.id === item.id);
        const precoOriginal = item.preco; 
        const infoPromo = processarPrecoProduto({ id: item.id, ml: item.ml, preco: precoOriginal });

        dados.valorTotalPix += infoPromo.pixValor * item.qtd;

        if (infoPromo.tem6x) {
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
    if (typeof sacola === 'undefined' || sacola.length === 0) return alert("Sua sacola está vazia!");
    if (!nomeFreteGlobal) return alert("⚠️ Selecione o frete antes de finalizar!");

    const modalCheckout = document.getElementById('modalCheckout');
    if (modalCheckout) modalCheckout.style.display = 'flex';
}

function coletarDadosCheckout(metodoPagamento, event) {
    const btnAcao = event.target;
    const textoOriginal = btnAcao.innerText;

    const dadosCarrinho = prepararDadosParaAsaas();
    const nomeInput = document.getElementById('cliente_nome').value.trim();

    // VALIDAÇÕES INICIAIS
    if (nomeInput.split(' ').length < 2) {
        alert("⚠️ Por favor, digite seu NOME COMPLETO.");
        return; // Sai da função sem travar o botão
    }

    const cpfLimpo = document.getElementById('cliente_cpf').value.replace(/\D/g, '');
    if (cpfLimpo.length < 11) {
        alert("⚠️ CPF inválido.");
        return;
    }

    let parcelasEscolhidas = 1;
    const limiteParcelas = (sacola.length > 0) ? (sacola[0].maxParcelas || 10) : 10;

    if (metodoPagamento === 'CREDIT_CARD') {
        const escolha = prompt(`Em quantas vezes deseja parcelar? (1 a ${limiteParcelas}x)`, "1");
        parcelasEscolhidas = parseInt(escolha);

        if (isNaN(parcelasEscolhidas) || parcelasEscolhidas < 1 || parcelasEscolhidas > limiteParcelas) {
            alert(`⚠️ Por favor, escolha um número de 1 a ${limiteParcelas}.`);
            return;
        }
    }

    // MONTAGEM DO OBJETO DE CHECKOUT
    const checkout = {
        cliente: {
            nome: nomeInput,
            email: document.getElementById('cliente_email').value,
            cpfCnpj: cpfLimpo,
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
            valor: (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : (limiteParcelas === 6 ? dadosCarrinho.valorTotalCartao6x : dadosCarrinho.valorTotalOriginal)) + valorFreteGlobal,
            parcelas: parcelasEscolhidas, 
            parcelasMaximas: limiteParcelas,
            itens: dadosCarrinho.itensDetalhados
        }
    };

    // ATIVA O ESTADO DE CARREGAMENTO
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
        // DESTRAVA O BOTÃO SE DER ERRO NO SERVIDOR
        btnAcao.innerText = textoOriginal;
        btnAcao.disabled = false;
    });
}
