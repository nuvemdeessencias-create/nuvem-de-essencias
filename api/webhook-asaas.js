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
    // --- 1. LIBERAÇÃO DE ACESSO (CORS) ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente a verificações do Asaas
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(200).send('Webhook Ativo');

    const body = req.body;
    console.log("Evento Recebido:", body.event);

    // --- 2. FILTRO DE EVENTOS ---
    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const payment = body.payment;
        
        // Verifica se o metadata com os itens existe
        if (!payment.metadata || !payment.metadata.itensPedido) {
            console.error("ERRO: Metadata ausente no pagamento", payment.id);
            return res.status(200).json({ status: "erro", message: "sem metadata" });
        }

        try {
            const itens = JSON.parse(payment.metadata.itensPedido);

            // --- 3. LOOP DE ATUALIZAÇÃO NO FIREBASE ---
            for (const item of itens) {
                const produtoRef = doc(db, "produtos", item.id);
                const snap = await getDoc(produtoRef);

                if (snap.exists()) {
                    const dados = snap.data();
                    
                    // Mapeia as opções (MLs) e subtrai a quantidade do estoque
                    const novasOpcoes = dados.opcoes.map(opt => {
                        const [mlTamanho] = opt.valor.split('|');
                        if (mlTamanho === item.ml) {
                            const estoqueAtual = parseInt(opt.estoque) || 0;
                            const novoEstoque = Math.max(0, estoqueAtual - item.qtd);
                            return { 
                                ...opt, 
                                estoque: novoEstoque, 
                                disponivel: novoEstoque > 0 
                            };
                        }
                        return opt;
                    });

                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                    console.log(`Estoque atualizado: Produto ${item.id} | ML ${item.ml}`);
                }
            }
        } catch (err) {
            console.error("Erro ao processar baixa de estoque:", err);
        }
    }

    // Retorna sempre 200 para o Asaas dar o envio como "Sucesso"
    return res.status(200).json({ success: true });
}
