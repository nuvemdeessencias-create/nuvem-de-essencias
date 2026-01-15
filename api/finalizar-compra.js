import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    const isProduction = process.env.VERCEL_ENV === 'production';
    const ASAAS_API_KEY = isProduction ? process.env.ASAAS_API_KEY_PROD : process.env.ASAAS_API_KEY_SANDBOX;
    const ASAAS_URL = isProduction ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

    const { cliente, endereco, pagamento, metadata } = req.body;

    try {
        const referer = req.headers.referer || "https://nuvem-de-essencias.vercel.app";
        const urlDinamica = referer.split('?')[0];

        // 1. Criar cliente no Asaas
        const customerRes = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: cliente.nome,
                email: cliente.email,
                cpfCnpj: cliente.cpfCnpj,
                mobilePhone: cliente.telefone,
                notificationDisabled: true
            })
        });

        const customerData = await customerRes.json();
        if (customerData.errors) return res.status(400).json({ error: customerData.errors[0].description });

        // 2. Definir a Referência Externa (ID do Pedido)
        const idPedidoGerado = `PED-${Date.now()}`;

        // --- NOVO: SALVAR NA COLEÇÃO "pedidos" ANTES DE IR PRO ASAAS ---
        try {
            const itensLista = JSON.parse(metadata.itensPedido || "[]");
            await setDoc(doc(db, "pedidos", idPedidoGerado), {
                cpf: metadata.cpfFidelidade,
                itens: itensLista,
                valorTotal: pagamento.valor,
                status: "pendente",
                dataCriacao: new Date().toISOString()
            });
            console.log("Pedido salvo no Firebase:", idPedidoGerado);
        } catch (firebaseErr) {
            console.error("Erro ao salvar no Firebase (não travou o Asaas):", firebaseErr.message);
        }
        // -------------------------------------------------------------

        const paymentBody = {
            customer: customerData.id,
            billingType: pagamento.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD',
            value: pagamento.valor,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: "Pedido Nuvem de Essências",
            externalReference: idPedidoGerado,
            metadata: metadata, // Enviando os dados originais para o Asaas também
            callback: { successUrl: urlDinamica, autoRedirect: false }
        };

        const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentBody)
        });

        const paymentData = await paymentRes.json();
        if (paymentData.errors) return res.status(400).json({ error: paymentData.errors[0].description });

        return res.status(200).json({
            success: true,
            invoiceUrl: paymentData.invoiceUrl 
        });

    } catch (error) {
        console.error("Erro crítico na API:", error);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
}
