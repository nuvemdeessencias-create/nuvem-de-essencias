import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

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
    if (req.method !== 'POST') return res.status(200).send('Webhook Ativo');

    const body = req.body;
    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const payment = body.payment;
        
        try {
            // --- PARTE 1: BAIXA DE ESTOQUE (COM CORREÇÃO DA BARRA '|') ---
            if (payment.metadata && payment.metadata.itensPedido) {
                const itens = JSON.parse(payment.metadata.itensPedido);

                for (const item of itens) {
                    const produtoRef = doc(db, "produtos", item.id);
                    const snap = await getDoc(produtoRef);

                    if (snap.exists()) {
                        const dados = snap.data();
                        let houveAlteracao = false;

                        const novasOpcoes = dados.opcoes.map(opt => {
                            // CORREÇÃO: Verifica se o "80 ml" está contido em "80 ml|239"
                            if (opt.valor.includes(item.ml.trim())) {
                                const estoqueAtual = parseInt(opt.estoque) || 0;
                                const quantidadeComprada = parseInt(item.qtd) || 1;
                                const novoEstoque = Math.max(0, estoqueAtual - quantidadeComprada);
                                houveAlteracao = true;
                                return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                            }
                            return opt;
                        });

                        if (houveAlteracao) {
                            await updateDoc(produtoRef, { opcoes: novasOpcoes });
                            console.log(`Sucesso: Estoque de ${item.id} baixado.`);
                        }
                    }
                }
            }
          
            // --- PARTE 2: FIDELIDADE (GARANTINDO A SOMA) ---
            const cpfFinal = payment.metadata?.cpfFidelidade;
            if (cpfFinal) {
                const cpfLimpo = cpfFinal.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                const pontosGanhos = Math.floor(payment.value);

                // Usamos setDoc com merge para garantir que NUNCA falhe
                await setDoc(clienteRef, { 
                    cpf: cpfLimpo,
                    pontos: increment(pontosGanhos),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
                
                console.log(`Sucesso: ${pontosGanhos} pontos para o CPF ${cpfLimpo}`);
            }

        } catch (err) {
            console.error("Erro fatal:", err.message);
        }
    }
    return res.status(200).json({ success: true });
}
