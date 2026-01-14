// Renomeado para coincidir com o erro "abrirCheckoutAsaas is not defined"
async function abrirCheckoutAsaas(metodoPagamento, event) {
    if (event) event.preventDefault();
    
    // Identifica o botão que foi clicado (PIX ou Cartão)
    const btnAcao = event.currentTarget || event.target;

    try {
        // 1. Validação do Frete Selecionado
        const cepNoCadastro = document.getElementById('end_cep').value.replace(/\D/g, '');
        if (!cepCalculadoGlobal || cepNoCadastro !== cepCalculadoGlobal) {
            alert("⚠️ Por favor, calcule o frete na sacola antes de prosseguir.");
            return;
        }

        // 2. Coleta de Dados e Cálculo do Valor (Produtos + Frete)
        const dadosCarrinho = prepararDadosParaAsaas();
        const nomeInput = document.getElementById('cliente_nome').value.trim();
        const freteValor = typeof valorFreteGlobal === 'number' ? valorFreteGlobal : 0;
        
        // Valor final que aparece na sua sacola
        const valorTotalFinal = (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalOriginal) + freteValor;

        // 3. Estado de Carregamento
        btnAcao.innerText = "PROCESSANDO...";
        btnAcao.disabled = true;

        // 4. Preparação do Metadata para o estoque
        const resumoItensEstoque = sacola.map(item => ({
            id: item.id,
            qtd: item.qtd,
            ml: item.ml
        }));

        const checkoutData = {
            cliente: { 
                nome: nomeInput, 
                email: document.getElementById('cliente_email').value,
                cpfCnpj: document.getElementById('cliente_cpf').value.replace(/\D/g, ''),
                telefone: document.getElementById('cliente_celular').value.replace(/\D/g, '')
            },
            pagamento: { 
                metodo: metodoPagamento, 
                valor: valorTotalFinal 
            },
            metadata: {
                itensPedido: JSON.stringify(resumoItensEstoque)
            }
        };

        // 5. Envio para a API na Vercel
        const response = await fetch('/api/finalizar-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
            // Abre o checkout do Asaas em nova guia
            window.open(data.invoiceUrl, "_blank");
            
            // Opcional: Mostra o modal de sucesso se ele existir no seu HTML
            const modalPrincipal = document.getElementById('modalCheckout');
            if (modalPrincipal) {
                modalPrincipal.innerHTML = `<div style="text-align:center; padding:40px; color:white;">
                    <h2 style="color:#b89356;">PEDIDO GERADO!</h2>
                    <p>Pague na página que foi aberta.</p>
                    <button onclick="window.location.reload()" style="background:#b89356; border:none; padding:10px 20px; color:white; border-radius:5px; cursor:pointer;">VOLTAR</button>
                </div>`;
            }
        } else {
            throw new Error(data.error || "Erro ao processar");
        }

    } catch (err) {
        console.error("Erro no processo:", err);
        alert("Erro: " + err.message);
        btnAcao.innerText = "FINALIZAR PAGAMENTO";
        btnAcao.disabled = false;
    }
}
