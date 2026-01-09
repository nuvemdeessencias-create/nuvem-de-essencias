/* --- checkout.js TOTALMENTE CORRIGIDO E PROFISSIONAL --- */

// Variáveis de controle global para o novo modal
let parcelasEscolhidasGlobal = 1;
let parcelaConfirmada = false;

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

    // Reset de segurança dos botões
    const btnPix = document.querySelector("button[onclick*='PIX']");
    const btnCartao = document.querySelector("button[onclick*='CREDIT_CARD']");
    if(btnPix) { btnPix.innerText = "PAGAR PIX"; btnPix.disabled = false; }
    if(btnCartao) { btnCartao.innerText = "CARTÃO"; btnCartao.disabled = false; }

    parcelaConfirmada = false; // Reseta trava de parcelas ao abrir

    const modalCheckout = document.getElementById('modalCheckout');
    if (modalCheckout) modalCheckout.style.display = 'flex';
}

function fecharModalParcelas() {
    document.getElementById('modalParcelas').style.display = 'none';
    parcelaConfirmada = false;
    // Destrava o botão do cartão caso o usuário desista de escolher as parcelas
    const btnCartao = document.querySelector("button[onclick*='CREDIT_CARD']");
    if (btnCartao) { btnCartao.innerText = "CARTÃO"; btnCartao.disabled = false; }
}

function coletarDadosCheckout(metodoPagamento, event) {
    const btnAcao = event.target;
    const dadosCarrinho = prepararDadosParaAsaas();
    const nomeInput = document.getElementById('cliente_nome').value.trim();

    // --- TRAVA DE SEGURANÇA: FRETE OBRIGATÓRIO ---
    // Impede que o cliente finalize se a sacola mudou e o frete não foi recalculado
    if (!valorFreteGlobal || valorFreteGlobal <= 0) {
        alert("⚠️ ATENÇÃO: A sacola foi alterada. Por favor, calcule o frete novamente para atualizar o valor total antes de finalizar.");
        
        // Foca no campo de CEP para facilitar para o cliente
        const campoCep = document.getElementById('inputCep');
        if (campoCep) campoCep.focus();
        
        return; // INTERROMPE a função e impede o envio ao servidor
    }

    // VALIDAÇÕES INICIAIS (Mantidas conforme seu original)
    if (nomeInput.split(' ').length < 2) {
        alert("⚠️ Por favor, digite seu NOME COMPLETO.");
        return;
    }

    const cpfLimpo = document.getElementById('cliente_cpf').value.replace(/\D/g, '');
    if (cpfLimpo.length < 11) {
        alert("⚠️ CPF inválido.");
        return;
    }

    const limiteParcelas = (sacola.length > 0) ? (sacola[0].maxParcelas || 10) : 10;
    const valorTotalBase = (limiteParcelas === 6 ? dadosCarrinho.valorTotalCartao6x : dadosCarrinho.valorTotalOriginal) + valorFreteGlobal;

    // NOVO SISTEMA DE PARCELAMENTO PROFISSIONAL (Mantido conforme seu original)
    if (metodoPagamento === 'CREDIT_CARD' && !parcelaConfirmada) {
        const lista = document.getElementById('listaParcelas');
        lista.innerHTML = '';
        
        for (let i = 1; i <= limiteParcelas; i++) {
            const valorParcela = (valorTotalBase / i).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
            const btn = document.createElement('button');
            btn.innerHTML = `<span style="color:#020b1f">${i}x</span> de <span style="color:#2ecc71; font-weight:bold">${valorParcela}</span>`;
            btn.style = "padding:15px; border:1px solid #eee; border-radius:10px; background:#fcfcfc; cursor:pointer; text-align:left; font-size:15px; transition:0.2s;";
            
            btn.onclick = () => {
                parcelasEscolhidasGlobal = i;
                parcelaConfirmada = true;
                document.getElementById('modalParcelas').style.display = 'none';
                coletarDadosCheckout('CREDIT_CARD', { target: document.querySelector("button[onclick*='CREDIT_CARD']") });
            };
            lista.appendChild(btn);
        }
        document.getElementById('modalParcelas').style.display = 'flex';
        return;
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
            // AQUI USAMOS O valorTotalOriginal pois o desconto promocional já vem aplicado do botão de oferta
            valor: dadosCarrinho.valorTotalOriginal + valorFreteGlobal, 
            parcelas: (metodoPagamento === 'PIX' ? 1 : parcelasEscolhidasGlobal),
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
        parcelaConfirmada = false;
        btnAcao.innerText = (metodoPagamento === 'PIX' ? "PAGAR PIX" : "CARTÃO");
        btnAcao.disabled = false;
    });
}
