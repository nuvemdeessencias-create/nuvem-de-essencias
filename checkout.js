async function coletarDadosCheckout(metodoPagamento, event) {
    if (event) event.preventDefault();
    
    // Identifica o botão clicado
    const btnAcao = event.currentTarget || event.target;
    if (!btnAcao) return;

    // 1. Validação de Frete e CEP
    const cepNoCadastro = document.getElementById('end_cep').value.replace(/\D/g, '');
    if (!cepCalculadoGlobal || cepNoCadastro !== cepCalculadoGlobal) {
        alert("⚠️ Por favor, calcule o frete na sacola antes de prosseguir.");
        return;
    }

    // 2. Coleta de dados básicos
    const dadosCarrinho = prepararDadosParaAsaas();
    const nomeInput = document.getElementById('cliente_nome').value.trim();
    if (nomeInput.split(' ').length < 2) return alert("⚠️ Digite seu nome completo.");
    
    const cpfLimpo = document.getElementById('cliente_cpf').value.replace(/\D/g, '');
    if (cpfLimpo.length < 11) return alert("⚠️ CPF inválido.");

    // 3. Cálculo do valor total (Produtos + Frete Selecionado)
    const freteValor = typeof valorFreteGlobal === 'number' ? valorFreteGlobal : 0;
    const valorTotalFinal = (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalOriginal) + freteValor;

    // 4. Bloqueia o botão para evitar cliques duplos
    const textoOriginal = btnAcao.innerText;
    btnAcao.innerText = "PROCESSANDO...";
    btnAcao.disabled = true;

    try {
        // 5. Prepara os dados para o estoque (Metadata)
        const resumoItensEstoque = sacola.map(item => ({
            id: item.id,
            qtd: item.qtd,
            ml: item.ml
        }));

        const checkoutData = {
            cliente: { 
                nome: nomeInput, 
                email: document.getElementById('cliente_email').value,
                cpfCnpj: cpfLimpo,
                telefone: document.getElementById('cliente_celular').value.replace(/\D/g, '')
            },
            endereco: {
                cep: cepNoCadastro,
                rua: document.getElementById('end_rua').value,
                numero: document.getElementById('end_numero').value,
                bairro: document.getElementById('end_bairro').value,
                cidade: document.getElementById('end_cidade').value,
                estado: document.getElementById('end_estado').value,
                complemento: document.getElementById('end_complemento').value
            },
            pagamento: { 
                metodo: metodoPagamento, 
                valor: valorTotalFinal 
            },
            metadata: {
                itensPedido: JSON.stringify(resumoItensEstoque)
            }
        };

        // 6. Envio para a API
        const response = await fetch('/api/finalizar-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
            window.open(data.invoiceUrl, "_blank");
            
            // Exibe mensagem de sucesso no lugar do formulário
            const modalPrincipal = document.getElementById('modalCheckout');
            if (modalPrincipal) {
                modalPrincipal.innerHTML = `<div style="text-align:center; padding:40px; color:white;">
                    <h2 style="color:#b89356;">PEDIDO GERADO!</h2>
                    <p>Aguardamos seu pagamento na página aberta.</p>
                    <button onclick="window.location.reload()" style="background:#b89356; border:none; padding:10px 20px; cursor:pointer; color:white; border-radius:5px;">VOLTAR</button>
                </div>`;
            }
        } else {
            throw new Error(data.error || "Erro ao gerar cobrança");
        }

    } catch (err) {
        alert("Erro: " + err.message);
        btnAcao.innerText = textoOriginal;
        btnAcao.disabled = false;
    }
}
