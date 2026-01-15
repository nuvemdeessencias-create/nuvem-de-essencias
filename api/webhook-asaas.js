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
    console.log("Evento Recebido:", body.event);

    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const payment = body.payment;
        
        try {
            // --- PARTE 1: BAIXA DE ESTOQUE ---
            if (payment.metadata && payment.metadata.itensPedido) {
                const itens = JSON.parse(payment.metadata.itensPedido);
                console.log("Processando itens para estoque...");

                for (const item of itens) {
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
                                return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                            }
                            return opt;
                        });
                        await updateDoc(produtoRef, { opcoes: novasOpcoes });
                        console.log(`Estoque atualizado: ${item.id}`);
                    }
                }
            }
          
            // --- PARTE 2: FIDELIDADE (CADASTRO/ATUALIZAÇÃO) ---
            const cpfFinal = payment.metadata?.cpfFidelidade;
            
            if (cpfFinal) {
                const cpfLimpo = cpfFinal.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                
                const pontosGanhos = Math.floor(payment.value);

                // setDoc com merge: true resolve o erro de "Documento não encontrado"
                await setDoc(clienteRef, { 
                    nome: "Cliente Novo", // Você pode editar no Firebase depois
                    cpf: cpfLimpo,
                    pontos: increment(pontosGanhos),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
                
                console.log(`Fidelidade: Sucesso para o CPF ${cpfLimpo}`);
            }

        } catch (err) {
            console.error("Erro no processamento:", err.message);
            // Retornamos 200 mesmo com erro para o Asaas não ficar repetindo o erro 500
            return res.status(200).json({ error: err.message });
        }
    }

    return res.status(200).json({ success: true });
}
