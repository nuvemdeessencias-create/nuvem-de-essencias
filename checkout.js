// ... (mantenha todo o código anterior de validações, CEP e montagem do objeto checkout)

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
            // 1. Abre o checkout em nova aba para preservar o comprovante lá
            window.open(data.invoiceUrl, "_blank");

            // 2. Localiza o container da sacola/checkout para mostrar o sucesso
            // Note: Usei 'modalCheckout' que é o ID que vi no seu código anterior
            const containerSacola = document.getElementById('modalCheckout'); 
            
            if (containerSacola) {
                containerSacola.innerHTML = `
                    <div style="padding: 40px 20px; text-align: center; background: #020b1f; color: white; border-radius: 12px; border: 1px solid #b89356; max-width: 450px; margin: auto;">
                        <div style="font-size: 50px; margin-bottom: 20px;">✔️</div>
                        <h2 style="color: #b89356; font-family: serif; margin-bottom: 15px;">Pedido Gerado!</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #d1d1d1; margin-bottom: 25px;">
                            O link de pagamento foi aberto em outra aba.<br>
                            Lá você poderá pagar e <b>baixar seu comprovante</b>.
                        </p>
                        <hr style="width: 80%; border: 0; border-top: 1px solid #b8935633; margin-bottom: 25px;">
                        <p style="font-weight: bold; margin-bottom: 15px;">Já finalizou o pagamento?</p>
                        <button onclick="voltarParaLoja()" 
                                style="background: #b89356; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; cursor: pointer; width: 100%; text-transform: uppercase;">
                            LIMPAR SACOLA E VOLTAR
                        </button>
                    </div>
                `;
            }
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

// FUNÇÃO DE RESET (Adicione ao final do checkout.js)
function voltarParaLoja() {
    localStorage.removeItem('sacola'); // Certifique-se que o nome da chave é 'sacola'
    window.location.reload(); // Recarrega para limpar o estado do site
}
