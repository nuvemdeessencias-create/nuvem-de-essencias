import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, increment } from "firebase/firestore"; // Adicionamos increment

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


// --- VERSÃO PARA DIAGNÓSTICO NO WEBHOOK ---
for (const item of itens) {
    console.log(`Tentando baixar item: ${item.id} - ML: ${item.ml}`);
    const produtoRef = doc(db, "produtos", item.id);
    const snap = await getDoc(produtoRef);

    if (snap.exists()) {
        const dados = snap.data();
        console.log("Produto encontrado no Firebase:", dados.nome);

        const novasOpcoes = dados.opcoes.map(opt => {
            const [mlTamanho] = opt.valor.split('|');
            
            // Debug: vamos ver o que o Firebase tem e o que o Asaas enviou
            console.log(`Comparando: [${mlTamanho.trim()}] com [${item.ml.trim()}]`);

            if (mlTamanho.trim().toLowerCase() === item.ml.trim().toLowerCase()) {
                const estoqueAtual = parseInt(opt.estoque) || 0;
                const quantidadeComprada = parseInt(item.qtd) || 1;
                console.log(`Baixando estoque: ${estoqueAtual} -> ${estoqueAtual - quantidadeComprada}`);
                return { ...opt, estoque: Math.max(0, estoqueAtual - quantidadeComprada) };
            }
            return opt;
        });

        await updateDoc(produtoRef, { opcoes: novasOpcoes });
    } else {
        console.error("ERRO: Produto ID não existe no Firebase:", item.id);
    }
}
                
            // --- PARTE 2: FIDELIDADE (SOMA DE PONTOS) ---
            // Buscamos o CPF que o site enviou no metadata ou na referência
            const cpfFinal = payment.metadata?.cpfFidelidade || payment.externalReference;
            
            if (cpfFinal) {
                const cpfLimpo = cpfFinal.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                
                // Calculamos os novos pontos (R$ 1,00 = 1 ponto)
                const pontosGanhos = Math.floor(payment.value);

                // IMPORTANTE: Usamos 'increment' para SOMAR aos pontos que ele já tem!
                await updateDoc(clienteRef, { 
                    pontos: increment(pontosGanhos),
                    ultimaAtualizacao: new Date().toISOString()
                });
                
                console.log(`Fidelidade: Adicionados ${pontosGanhos} pontos ao CPF ${cpfLimpo}`);
            }

        } catch (err) {
            console.error("Erro no processamento:", err.message);
        }
    }

    return res.status(200).json({ success: true });
}
