import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(200).send('Webhook Ativo');

    const body = req.body;
    console.log("Evento Recebido do Asaas:", body.event);

    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const payment = body.payment;
        
        if (!payment.metadata || !payment.metadata.itensPedido) {
            console.error("ERRO: Metadata não encontrado no pagamento", payment.id);
            return res.status(200).json({ status: "erro", message: "sem metadata" });
        }

        try {
            const itens = JSON.parse(payment.metadata.itensPedido);

            for (const item of itens) {
                // Aqui o item.id será "Xay7UtaNUSL7JrhMwMaL"
                const produtoRef = doc(db, "produtos", item.id);
                const snap = await getDoc(produtoRef);

                if (snap.exists()) {
                    const dados = snap.data();
                    
                    const novasOpcoes = dados.opcoes.map(opt => {
                        const [mlTamanho] = opt.valor.split('|');
                        if (mlTamanho.trim() === item.ml.trim()) {
                            const estoqueAtual = parseInt(opt.estoque) || 0;
                            const quantidadeComprada = parseInt(item.qtd) || 1;
                            const novoEstoque = Math.max(0, estoqueAtual - quantidadeComprada);
                            
                            return { 
                                ...opt, 
                                estoque: novoEstoque, 
                                disponivel: novoEstoque > 0 
                            };
                        }
                        return opt;
                    });

                    // SALVA A ALTERAÇÃO NO FIREBASE
                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                    console.log(`Sucesso: Estoque de ${item.id} atualizado.`);
                } else {
                    console.error(`ERRO: Produto ID '${item.id}' não existe no Firestore.`);
                }
            }
        } catch (err) {
            console.error("Erro interno ao processar baixa:", err.message);
            return res.status(200).json({ status: "erro", message: err.message });
        }
    }

    return res.status(200).json({ success: true });
}
