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
            // 1. BUSCA O PEDIDO NO SEU BANCO PELO ID (externalReference)
            // O Asaas envia: "PED-1768503890207", precisamos do ID puro
            const pedidoId = payment.externalReference;
            const pedidoRef = doc(db, "pedidos", pedidoId); 
            const pedidoSnap = await getDoc(pedidoRef);

            if (!pedidoSnap.exists()) {
                console.error("Pedido não encontrado no Firebase:", pedidoId);
                return res.status(200).json({ error: "Pedido não registrado" });
            }

            const dadosPedido = pedidoSnap.data();

            // 2. BAIXA DE ESTOQUE (Usando os dados que já estão no seu Firebase)
            for (const item of dadosPedido.itens) {
                const produtoRef = doc(db, "produtos", item.id);
                const produtoSnap = await getDoc(produtoRef);

                if (produtoSnap.exists()) {
                    const prodData = produtoSnap.data();
                    const novasOpcoes = prodData.opcoes.map(opt => {
                        if (opt.valor.includes(item.ml)) {
                            const estoqueAtual = parseInt(opt.estoque) || 0;
                            const novoEstoque = Math.max(0, estoqueAtual - (item.qtd || 1));
                            return { ...opt, estoque: novoEstoque, disponivel: novoEstoque > 0 };
                        }
                        return opt;
                    });
                    await updateDoc(produtoRef, { opcoes: novasOpcoes });
                }
            }

            // 3. FIDELIDADE (Usando o CPF que está no pedido)
            if (dadosPedido.cpf) {
                const cpfLimpo = dadosPedido.cpf.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                await setDoc(clienteRef, { 
                    pontos: increment(Math.floor(payment.value)),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
            }

            // 4. MARCA PEDIDO COMO PAGO
            await updateDoc(pedidoRef, { status: "pago", dataPagamento: new Date().toISOString() });

            return res.status(200).json({ success: true });

        } catch (err) {
            console.error("Erro no processamento:", err.message);
            return res.status(200).json({ error: err.message });
        }
    }

    return res.status(200).json({ success: true });
}import { initializeApp, getApps, getApp } from "firebase/app";
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
    // Aceita qualquer status de confirmação do Asaas
    if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(body.event)) {
        const payment = body.payment;
        
        try {
            // --- PARTE 1: ESTOQUE ---
            if (payment.metadata?.itensPedido) {
                const itens = JSON.parse(payment.metadata.itensPedido);

                for (const item of itens) {
                    const produtoRef = doc(db, "produtos", item.id.trim());
                    const snap = await getDoc(produtoRef);

                    if (snap.exists()) {
                        const dados = snap.data();
                        const novasOpcoes = dados.opcoes.map(opt => {
                            // Limpeza total para comparação: tira espaços e deixa minúsculo
                            const mlFirebase = String(opt.valor).split('|')[0].toLowerCase().trim();
                            const mlPedido = String(item.ml).toLowerCase().trim();

                            if (mlFirebase === mlPedido || opt.valor.includes(mlPedido)) {
                                const estoqueAtual = parseInt(opt.estoque) || 0;
                                const qtdComprada = parseInt(item.qtd) || 1;
                                return { ...opt, estoque: Math.max(0, estoqueAtual - qtdComprada), disponivel: (estoqueAtual - qtdComprada) > 0 };
                            }
                            return opt;
                        });
                        await updateDoc(produtoRef, { opcoes: novasOpcoes });
                    }
                }
            }
          
            // --- PARTE 2: FIDELIDADE ---
            const cpfFinal = payment.metadata?.cpfFidelidade || payment.externalReference?.replace(/\D/g, '');
            if (cpfFinal) {
                const cpfLimpo = cpfFinal.replace(/\D/g, '');
                const clienteRef = doc(db, "clientes", cpfLimpo);
                
                // Força o valor a ser um número para o increment funcionar
                const valorNumerico = Math.floor(Number(payment.value));

                await setDoc(clienteRef, { 
                    cpf: cpfLimpo,
                    pontos: increment(valorNumerico),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
            }

        } catch (err) {
            console.error("Erro no processamento:", err.message);
        }
    }
    return res.status(200).json({ success: true });
}
