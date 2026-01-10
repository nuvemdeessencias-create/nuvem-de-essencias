/* --- checkout.js TOTALMENTE CORRIGIDO E TESTADO --- */

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
        dados.valorTotalCartao6x += (infoPromo.tem6x ? infoPromo.valor6x : precoOriginal) * item.qtd;
        dados.valorTotalOriginal += precoOriginal * item.qtd;
        
        dados.itensDetalhados.push({ 
            nome: p ? p.nome : "Produto", 
            quantidade: item.qtd, 
            precoUnitario: precoOriginal 
        });
    });

    return dados;
}

function abrirCheckoutAsaas() {
    if (typeof sacola === 'undefined' || sacola.length === 0) return alert("Sua sacola está vazia!");
    if (!nomeFreteGlobal) return alert("⚠️ Selecione o frete antes de finalizar!");

    const btnPix = document.getElementById('btn-pagar-pix');
    const btnCartao = document.getElementById('btn-pagar-cartao');
    if(btnPix) { btnPix.innerText = "PAGAR PIX"; btnPix.disabled = false; }
    if(btnCartao) { btnCartao.innerText = "CARTÃO"; btnCartao.disabled = false; }

    parcelaConfirmada = false;
    const modalCheckout = document.getElementById('modalCheckout');
    if (modalCheckout) modalCheckout.style.display = 'flex';
}

function fecharModalParcelas() {
    document.getElementById('modalParcelas').style.display = 'none';
    parcelaConfirmada = false;
    const btnCartao = document.getElementById('btn-pagar-cartao');
    if (btnCartao) { btnCartao.innerText = "CARTÃO"; btnCartao.disabled = false; }
}

function coletarDadosCheckout(metodoPagamento, event) {
    if (event) event.preventDefault();
    const btnAcao = event.currentTarget || event.target;

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

    const limiteParcelas = (sacola.length > 0) ? (sacola[0].maxParcelas || 10) : 10;
    // Proteção para garantir que valorFreteGlobal seja número
    const freteSeguro = typeof valorFreteGlobal === 'number' ? valorFreteGlobal : 0;
    const valorTotalBase = (limiteParcelas === 6 ? dadosCarrinho.valorTotalCartao6x : dadosCarrinho.valorTotalOriginal) + freteSeguro;

    if (metodoPagamento === 'CREDIT_CARD' && !parcelaConfirmada) {
        const lista = document.getElementById('listaParcelas');
        if (!lista) return alert("Erro: Container de parcelas não encontrado.");
        
        lista.innerHTML = '';
        for (let i = 1; i <= limiteParcelas; i++) {
            const valorParcela = (valorTotalBase / i).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
            const btnP = document.createElement('button');
            btnP.type = "button";
            btnP.style = "display:block; width:100%; padding:12px; margin-bottom:8px; border:1px solid #ddd; border-radius:6px; cursor:pointer; text-align:left; background:#fff; color:#333;";
            btnP.innerHTML = `<span>${i}x</span> de <b>${valorParcela}</b>`;
            btnP.onclick = () => {
                parcelasEscolhidasGlobal = i;
                parcelaConfirmada = true;
                document.getElementById('modalParcelas').style.display = 'none';
                coletarDadosCheckout('CREDIT_CARD', { currentTarget: btnAcao });
            };
            lista.appendChild(btnP);
        }
        document.getElementById('modalParcelas').style.display = 'flex';
        return;
    }

    const textoOriginal = btnAcao.innerText;
    btnAcao.innerText = "PROCESSANDO...";
    btnAcao.disabled = true;

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
            estado: document.getElementById('end_estado').value
        },
        pagamento: {
            metodo: metodoPagamento,
            valor: valorTotalBase, 
            parcelas: (metodoPagamento === 'PIX' ? 1 : parcelasEscolhidasGlobal)
        }
    };

    fetch('/api/finalizar-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok && data.invoiceUrl) {
            window.open(data.invoiceUrl, "_blank");
            
            const modalPrincipal = document.getElementById('modalCheckout');
            if (modalPrincipal) {
                modalPrincipal.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100vh; background: rgba(2, 11, 31, 0.95); position: fixed; top: 0; left: 0; z-index: 9999;">
                        <div style="background: #020b1f; color: white; padding: 40px 30px; border-radius: 15px; border: 1px solid #b89356; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <div style="font-size: 60px; color: #b89356; margin-bottom: 20px; animation: scaleUp 0.5s ease-out;">✔️</div>
                            <h2 style="color: #b89356; font-family: serif; margin-bottom: 15px; font-size: 24px; letter-spacing: 1px;">PEDIDO GERADO</h2>
                            <p style="font-size: 15px; color: #d1d1d1; line-height: 1.6; margin-bottom: 30px;">
                                A página de pagamento foi aberta em uma nova guia.<br>
                                <span style="color: #b89356;">Pague e baixe seu comprovante por lá.</span>
                            </p>
                            <div style="border-top: 1px solid #b8935633; padding-top: 25px;">
                                <p style="font-size: 13px; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px;">JÁ FINALIZOU O PAGAMENTO?</p>
                                <button onclick="voltarParaLoja()"  
                                        style="background: #b89356; color: white; border: none; padding: 16px; width: 100%; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;">
                                    LIMPAR SACOLA E VOLTAR
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>
                        @keyframes scaleUp { from { transform: scale(0); } to { transform: scale(1); } }
                    </style>
                `;
            }
        } else {
            throw new Error(data.error || "Erro no processamento");
        }
    })
    .catch(err => {
        alert("Erro: " + err.message);
        btnAcao.innerText = textoOriginal;
        btnAcao.disabled = false;
        parcelaConfirmada = false;
    });
}

function voltarParaLoja() {
    localStorage.removeItem('sacola');
    window.location.reload();
}
