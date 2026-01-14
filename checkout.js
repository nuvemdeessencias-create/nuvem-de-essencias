async function coletarDadosCheckout(metodoPagamento, event) {
    if (event) event.preventDefault();
    const btnAcao = event.currentTarget || event.target;

    try {
        // Validação do CEP e Frete
        const cepNoCadastro = document.getElementById('end_cep').value.replace(/\D/g, '');
        if (cepCalculadoGlobal === "" || cepNoCadastro !== cepCalculadoGlobal) {
            alert("⚠️ O CEP não confere com o frete calculado. Recalcule na sacola.");
            return;
        }

        const dadosCarrinho = prepararDadosParaAsaas();
        const nomeInput = document.getElementById('cliente_nome').value.trim();

        if (nomeInput.split(' ').length < 2) return alert("⚠️ Digite seu nome completo.");
        const cpfLimpo = document.getElementById('cliente_cpf').value.replace(/\D/g, '');
        if (cpfLimpo.length < 11) return alert("⚠️ CPF inválido.");

        // Cálculo do Valor Total Unificado
        const limiteParcelas = (sacola.length > 0) ? (sacola[0].maxParcelas || 10) : 10;
        const freteSeguro = typeof valorFreteGlobal === 'number' ? valorFreteGlobal : 0;
        const valorTotalFinal = (metodoPagamento === 'PIX' ? dadosCarrinho.valorTotalPix : (limiteParcelas === 6 ? dadosCarrinho.valorTotalCartao6x : dadosCarrinho.valorTotalOriginal)) + freteSeguro;

        // Estado de carregamento do botão
        const textoOriginal = btnAcao.innerText;
        btnAcao.innerText = "PROCESSANDO...";
        btnAcao.disabled = true;

        // 1. Prepara o resumo para baixar o estoque no Firebase
        const resumoItensEstoque = sacola.map(item => ({
            id: item.id,
            qtd: item.qtd,
            ml: item.ml
        }));

        // 2. Monta o objeto que a sua API finalizar-compra.js espera
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
                valor: valorTotalFinal,
                parcelas: typeof parcelasEscolhidasGlobal !== 'undefined' ? parcelasEscolhidasGlobal : 1
            },
            metadata: {
                itensPedido: JSON.stringify(resumoItensEstoque)
            }
        };

        // 3. Envio Unificado (Conserta o erro do canal fechado)
        const response = await fetch('/api/finalizar-compra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
            window.open(data.invoiceUrl, "_blank");
            // Dispara o modal de sucesso (Aquele azul escuro com o check dourado)
            const modalPrincipal = document.getElementById('modalCheckout');
            if (modalPrincipal) {
                modalPrincipal.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; background: rgba(2, 11, 31, 0.95); position: fixed; top: 0; left: 0; z-index: 9999;">
                        <div style="background: #020b1f; color: white; padding: 40px 30px; border-radius: 15px; border: 1px solid #b89356; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <div style="font-size: 60px; color: #b89356; margin-bottom: 20px;">✔️</div>
                            <h2 style="color: #b89356; font-family: serif; margin-bottom: 15px; font-size: 24px;">PEDIDO GERADO</h2>
                            <button onclick="window.location.reload()" style="background: #b89356; color: white; border: none; padding: 16px; width: 100%; border-radius: 5px; font-weight: bold; cursor: pointer;">
                                VOLTAR PARA A LOJA
                            </button>
                        </div>
                    </div>`;
            }
        } else {
            throw new Error(data.error || "Erro ao processar pagamento");
        }

    } catch (err) {
        alert("Erro: " + err.message);
        btnAcao.innerText = "FINALIZAR PAGAMENTO";
        btnAcao.disabled = false;
    }
}
