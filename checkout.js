function coletarDadosCheckout(metodoPagamento, event) {
    const dadosCarrinho = prepararDadosParaAsaas();
    if (!dadosCarrinho) return alert("Seu carrinho está vazio!");

    if (typeof valorFreteGlobal === 'undefined' || valorFreteGlobal === null) {
        return alert("Erro: Frete não identificado. Por favor, calcule o frete novamente.");
    }

    const nomeInput = document.getElementById('cliente_nome').value.trim();
    if (nomeInput.split(' ').length < 2) {
        return alert("⚠️ Por favor, digite seu NOME COMPLETO (nome e sobrenome).");
    }

    // MONTAGEM DO OBJETO DE ENVIO
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
            metodo: metodoPagamento, // Sem acento para evitar erros
            valor: (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalCartao6x) + valorFreteGlobal,
            parcelasMaximas: dadosCarrinho.temPromo6xAtiva ? 6 : 10,
            itens: dadosCarrinho.itensDetalhados // Corrigido para bater com o nome na função prepararDados
        }
    }; // A chave de fechamento que estava faltando estava aqui!

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
