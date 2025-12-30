export default async function handler(req, res) {
  const { code, state } = req.query;

  // 1. Puxa as chaves que você salvou no "cofre" da Vercel
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  // Caso o código de autorização não exista (erro no login)
  if (!code) {
    return res.status(400).json({ error: "Código de autorização não encontrado" });
  }

  try {
    // 2. Troca o código temporário por um Token de Acesso permanente do GitHub
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        state,
      }),
    });

    const data = await response.json();

    // 3. Envia o token de volta para a interface do Decap CMS
    const content = `
      <script>
        const receiveMessage = (message) => {
          if (message.data === "authorizing:github") {
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(data)}',
              message.origin
            );
          }
        };
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
