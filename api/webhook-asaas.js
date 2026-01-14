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
    // Responde sempre 200 para o Asaas não achar que seu site caiu
    if (req.method !== 'POST') return res.status(200).send('OK');

    const body = req.body;

    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const infoPagamento = body.payment;
        
        // Se o metadata não existir, ignoramos para não dar erro de código
        if (!infoPagamento.metadata || !infoPagamento.metadata.itensPedido) {
            console.log("Pagamento confirmado, mas sem itens no metadata.");
            return res.status(200).json({ status: "sem_metadata" });
        }

        const itens = JSON.parse(infoPagamento.metadata.itensPedido);

        for (const item of itens) {
            try {
                const produtoRef = doc(db, "produtos", item.id);
                const snap = await getDoc(produtoRef);

                if (snap.exists()) {
                    const dados = snap.data();
                    const novasOpcoes = dados.opcoes.map(opt => {
                        const [mlTamanho] = opt.valor.split('|');
                        if (mlTamanho === item.ml) {
                            const novoEstoque = Math.max(0, (opt.estoque || 0) - item.qtd);
                            return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                        }
                        return opt;
                    });
                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                }
            } catch (err) {
                console.error("Erro ao baixar estoque do item:", item.id, err);
            }
        }
    }

    return res.status(200).json({ success: true });
}
