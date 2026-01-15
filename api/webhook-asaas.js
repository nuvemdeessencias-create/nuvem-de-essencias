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
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        try {
            // 1. LOCALIZAR O PEDIDO (Tenta com e sem o prefixo PED-)
            const refLimpa = payment.externalReference;
            let pedidoRef = doc(db, "pedidos", refLimpa);
            let pedidoSnap = await getDoc(pedidoRef);

            // Se não achou, tenta sem o prefixo (caso o Firebase tenha salvo apenas os números)
            if (!pedidoSnap.exists() && refLimpa.includes('-')) {
                const apenasNumeros = refLimpa.split('-')[1];
                pedidoRef = doc(db, "pedidos", apenasNumeros);
                pedidoSnap = await getDoc(pedidoRef);
            }

            if (!pedidoSnap.exists()) {
                console.error("Pedido não encontrado no banco:", refLimpa);
                return res.status(200).json({ error: "Pedido inexistente" });
            }

            const dadosPedido = pedidoSnap.data();

            // 2. BAIXA DE ESTOQUE
            for (const item of dadosPedido.itens) {
                const produtoRef = doc(db, "produtos", item.id);
                const produtoSnap = await getDoc(produtoRef);

                if (produtoSnap.exists()) {
                    const prodData = produtoSnap.data();
                    const novasOpcoes = prodData.opcoes.map(opt => {
                        const mlFirebase = String(opt.valor).split('|')[0].trim();
                        if (mlFirebase === item.ml.trim()) {
                            const estoqueAtual = parseInt(opt.estoque) || 0;
                            const novoEstoque = Math.max(0, estoqueAtual - (item.qtd || 1));
                            return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                        }
                        return opt;
                    });
                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                }
            }

            // 3. FIDELIDADE (Usa o CPF que está DENTRO do pedido)
            if (dadosPedido.cpf) {
                const cpfLimpo = dadosPedido.cpf.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                await setDoc(clienteRef, { 
                    cpf: cpfLimpo,
                    pontos: increment(Math.floor(payment.value)),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
            }

            // 4. ATUALIZAR STATUS PARA PAGO
            await updateDoc(pedidoRef, { 
                status: "pago", 
                dataPagamento: new Date().toISOString() 
            });

            return res.status(200).json({ success: true });

        } catch (err) {
            console.error("Erro no Webhook:", err.message);
            return res.status(200).json({ error: err.message });
        }
    }
    return res.status(200).json({ success: true });
}
