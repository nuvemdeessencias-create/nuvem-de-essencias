// O nome agora combina com o seu index.html para não dar "not defined"
async function abrirCheckoutAsaas(metodoPagamento, event) {
    // PROTEÇÃO: Impede que o erro de 'currentTarget' trave o código
    if (event && event.preventDefault) event.preventDefault();
    
    // Tenta pegar o botão de várias formas para garantir que funcione
    const btnAcao = (event && (event.currentTarget || event.target)) || document.querySelector('button[onclick*="abrirCheckoutAsaas"]');

    try {
        // 1. Validação de Frete
        const cepNoCadastro = document.getElementById('end_cep').value.replace(/\D/g, '');
        if (!cepCalculadoGlobal || cepNoCadastro !== cepCalculadoGlobal) {
            alert("⚠️ Por favor, calcule o frete antes de finalizar.");
            return;
        }

        // 2. Cálculos de Valor
        const dadosCarrinho = prepararDadosParaAsaas();
        const freteValor = typeof valorFreteGlobal === 'number' ? valorFreteGlobal : 0;
        const valorTotalFinal = (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : dadosCarrinho.valorTotalOriginal) + freteValor;

        // 3. Muda o texto do botão com segurança
        if (btnAcao) {
            btnAcao.innerText = "PROCESSANDO...";
            btnAcao.disabled = true;
        }

        // 4. Prepara os Metadados para o estoque
        const resumoItensEstoque = sacola.map(item => ({
            id: item.id,
            qtd: item.qtd,
            ml: item.ml
        }));

        const checkoutData = {
            cliente: { 
                nome: document.getElementById('cliente_nome').value.trim(), 
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

        // 5. Chamada para a API
        const response = await fetch('/api/finalizar-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
            window.open(data.invoiceUrl, "_blank");
            
            // Sucesso: Limpa o formulário e avisa o cliente
            const modalPrincipal = document.getElementById('modalCheckout');
            if (modalPrincipal) {
                modalPrincipal.innerHTML = `
                    <div style="text-align:center; padding:40px; background:#020b1f; color:white; border-radius:15px; border:1px solid #b89356;">
                        <h2 style="color:#b89356;">PEDIDO GERADO!</h2>
                        <p>O pagamento foi aberto em uma nova guia.</p>
                        <button onclick="window.location.reload()" style="background:#b89356; color:white; padding:12px 25px; border:none; border-radius:5px; margin-top:20px; cursor:pointer;">VOLTAR À LOJA</button>
                    </div>`;
            }
        } else {
            throw new Error(data.error || "Erro no servidor");
        }

    } catch (err) {
        console.error("Erro no checkout:", err);
        alert("Erro ao processar: " + err.message);
        
        // Destrava o botão em caso de erro
        if (btnAcao) {
            btnAcao.innerText = "FINALIZAR PAGAMENTO";
            btnAcao.disabled = false;
        }
    }
}
