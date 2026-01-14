import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

// Suas credenciais Firebase (conforme seu index.html)
const firebaseConfig = {
    apiKey: "AIzaSyA9_9_NfnhbUnKUrXHUw8f0IFptCjXRf6M",
    authDomain: "nuvem-de-essencias.firebaseapp.com",
    projectId: "nuvem-de-essencias",
    storageBucket: "nuvem-de-essencias.firebasestorage.app",
    messagingSenderId: "929136751660",
    appId: "1:929136751660:web:408079a808e0918ede0d89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const evento = req.body;

    // Só prossegue se o pagamento for confirmado ou recebido
    if (evento.event === 'PAYMENT_RECEIVED' || evento.event === 'PAYMENT_CONFIRMED') {
        const metadata = evento.payment.metadata;

        if (metadata && metadata.itensPedido) {
            const itens = JSON.parse(metadata.itensPedido);

            for (const item of itens) {
                try {
                    const produtoRef = doc(db, "produtos", item.id);
                    const docSnap = await getDoc(produtoRef);

                    if (docSnap.exists()) {
                        const dados = docSnap.data();
                        const novasOpcoes = dados.opcoes.map(opt => {
                            const [mlTamanho] = opt.valor.split('|');
                            // Se for o ML correto, subtrai a quantidade
                            if (mlTamanho === item.ml) {
                                const novoEstoque = Math.max(0, (opt.estoque || 0) - item.qtd);
                                return { 
                                    ...opt, 
                                    estoque: novoEstoque,
                                    disponivel: novoEstoque > 0 
                                };
                            }
                            return opt;
                        });

                        await updateDoc(produtoRef, { opcoes: novasOpcoes });
                        console.log(`Estoque atualizado para: ${item.id}`);
                    }
                } catch (error) {
                    console.error("Erro ao atualizar estoque:", error);
                }
            }
        }
    }

    // O Asaas exige que você retorne status 200
    res.status(200).json({ ok: true });
}
