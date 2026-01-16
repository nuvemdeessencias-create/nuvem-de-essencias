import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, setDoc, increment } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA9_9_NfnhbUnKUrXHUw8f0IFptCjXRf6M",
    authDomain: "nuvem-de-essencias.firebaseapp.com",
    projectId: "nuvem-de-essencias",
    storageBucket: "nuvem-de-essencias.firebasestorage.app",
    messagingSenderId: "929136751660",
    appId: "1:929136751660:web:408079a808e0918ede0d89"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    const { event, payment } = req.body;
    const refLimpa = payment.externalReference;

    try {
        // 1. LOCALIZAR O PEDIDO NO FIREBASE
        let pedidoRef = doc(db, "pedidos", refLimpa);
        let pedidoSnap = await getDoc(pedidoRef);

        if (!pedidoSnap.exists() && refLimpa.includes('-')) {
            const apenasNumeros = refLimpa.split('-')[1];
            pedidoRef = doc(db, "pedidos", apenasNumeros);
            pedidoSnap = await getDoc(pedidoRef);
        }

        if (!pedidoSnap.exists()) {
            console.error("Pedido não encontrado:", refLimpa);
            return res.status(200).json({ error: "Pedido inexistente" });
        }

        const dadosPedido = pedidoSnap.data();

        // --- CASO A: PAGAMENTO CONFIRMADO ---
        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
            
            // A.1 - BAIXA DE ESTOQUE
            for (const item of dadosPedido.itens) {
                const produtoRef = doc(db, "produtos", item.id);
                const produtoSnap = await getDoc(produtoRef);
                if (produtoSnap.exists()) {
                    const prodData = produtoSnap.data();
                    const novasOpcoes = prodData.opcoes.map(opt => {
                        const mlFirebase = String(opt.valor).split('|')[0].trim();
                        if (mlFirebase === item.ml.trim()) {
                            const novoEstoque = Math.max(0, (parseInt(opt.estoque) || 0) - (item.qtd || 1));
                            return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                        }
                        return opt;
                    });
                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                }
            }

            // A.2 - FIDELIDADE (TRAVA DE SEGURANÇA CONTRA PONTOS INFINITOS)
            if (dadosPedido.cpf) {
                // Usamos a base calculada na FINALIZAÇÃO (Valor - Frete - Descontos usados)
                const pontosNovos = Math.max(0, Math.floor(dadosPedido.baseCalculoPontos || 0));

                if (pontosNovos > 0) {
                    const clienteRef = doc(db, "clientes", dadosPedido.cpf.replace(/\D/g, ''));
                    await updateDoc(clienteRef, { 
                        pontos: increment(pontosNovos),
                        ultimaAtualizacao: new Date().toISOString()
                    });
                }
            }

            // A.3 - ATUALIZA STATUS DO PEDIDO
            await updateDoc(pedidoRef, { status: "pago", dataPagamento: new Date().toISOString() });
        }

        // --- CASO B: PAGAMENTO VENCIDO OU DELETADO (DEVOLUÇÃO DE PONTOS) ---
        else if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED') {
            if (dadosPedido.status === "pendente" && dadosPedido.cpf) {
                const pontosParaDevolver = parseInt(dadosPedido.pontosResgatadosNoCheckout || 0);
                
                if (pontosParaDevolver > 0) {
                    const clienteRef = doc(db, "clientes", dadosPedido.cpf.replace(/\D/g, ''));
                    await updateDoc(clienteRef, {
                        pontos: increment(pontosParaDevolver),
                        ultimaDevolucao: new Date().toISOString()
                    });
                }
                await updateDoc(pedidoRef, { status: "cancelado_devolvido" });
            }
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Erro no Webhook:", err.message);
        return res.status(200).json({ error: err.message });
    }
}
