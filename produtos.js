const meusProdutos = [ 
    {
        id: "fucsia",
        marca: "SHAKIRA",
        nome: "SHAKIRA FUCSIA EDP",
        descricao: "Uma fragrância floral frutada eletrizante. Abre com notas de framboesa e cassis, evoluindo para um coração de jasmim e tuberosa. Ideal para mulheres que buscam energia e feminilidade vibrante.",
        imagem: "img/shakira.avif",
        secao: "alta",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "80ML", valor: "80ml|239.00", promoPix: false }]
    },
    {
        id: "rojo",
        marca: "SHAKIRA",
        nome: "SHAKIRA ROJO EDP",
        descricao: "Um perfume poderoso que celebra a força feminina. Possui notas de frutas vermelhas combinadas com um toque de pimenta rosa e um fundo amadeirado de cedro. Uma escolha marcante e audaciosa.",
        imagem: "img/rojo.jpeg",
        secao: "alta",
        estoque: 5,
        disponivel: true,
        opcoes: [{ texto: "80ML", valor: "80ml|239.00", promoPix: false }]
    },
    {
        id: "shakira-ama",
        marca: "SHAKIRA",
        nome: "SHAKIRA AMARILLO EDP",
        descricao: "Uma fragrância solar e refrescante. Notas cítricas misturadas com flores brancas que trazem a sensação de um dia de verão. Leve, alegre e perfeita para uso diário.",
        imagem: "img/shakiraamarillo.avif",
        secao: "alta",
        estoque: 0,
        disponivel: false,
        opcoes: [{ texto: "80ML - INDISPONÍVEL", valor: "80ml|0.00", promoPix: false }]
    },
    {
        id: "chloe",
        marca: "CHLOE",
        nome: "CHLOÉ EDP",
        descricao: "O clássico da sofisticação. Notas de rosa damascena, peônia e lichia. É um perfume floral leve e refrescante.",
        imagem: "img/chloedp.avif",
        secao: "alta",
        opcoes: [
            { texto: "50ML", valor: "50ml|809.00", estoque: 2, disponivel: true, promoPix: false },
            { texto: "75ML", valor: "75ml|939.00", estoque: 0, disponivel: true, promoPix: false }
        ]
    },
   
    {
        id: "gabriela",
        marca: "GABRIELA SABATINI",
        nome: "GABRIELA SABATINI EDT",
        descricao: "Fragrância atemporal e icônica. Combina notas cítricas com flores brancas (jasmim e madressilva) e um fundo quente de baunilha e âmbar. Ideal para mulheres clássicas e decididas.",
        imagem: "img/gabrielasabatini.webp",
        secao: "alta",
        estoque: 2,
        disponivel: true,
        opcoes: [{ texto: "60ML", valor: "60ml|169.00", promoPix: false }]
    },
    {
        id: "lady",
        marca: "PACO RABANNE",
        nome: "LADY MILLION EDP",
        descricao: "O aroma da riqueza e do poder. Notas deslumbrantes de néroli, limão amalfi e framboesa, seguidas por um coração de flor de laranjeira. Um perfume floral amadeirado viciante e luxuoso.",
        imagem: "img/ladymillion.avif",
        secao: "alta",
        estoque: 4,
        disponivel: true,
        opcoes: [{ texto: "80ML", valor: "80ml|869.00", promoPix: false }]
    },
    {
        id: "invictus",
        marca: "PACO RABANNE",
        nome: "INVICTUS EDT",
        descricao: "A essência da victory. Notas oceânicas, toranja e folhas de louro. Um perfume amadeirado aquático que exala frescor e sensualidade para o homem moderno e competitivo.",
        imagem: "img/invictus.jpg",
        secao: "alta",
        estoque: 0,
        disponivel: false,
        opcoes: [{ texto: "100ML - ESGOTADO", valor: "100ml|0.00", promoPix: false }]
    },
    {
        id: "diamond",
        marca: "MARINA DE BOURBON",
        nome: "MARINA DIAMOND EDP",
        descricao: "Fragrância oriental floral luxuosa. Notas de frutas vermelhas, íris e jasmim com um fundo de patchouli e almíscar. Um perfume joia, perfeito para eventos noturnos e ocasiões especiais.",
        imagem: "img/marinadiamond.webp",
        secao: "alta",
        estoque: 0,
        disponivel: false,
        opcoes: [{ texto: "100ML", valor: "100ml|0.00", promoPix: false }]
    },
    {
        id: "animale-f",
        marca: "ANIMALE",
        nome: "ANIMALE FEM EDP",
        descricao: "Sensualidade misteriosa e magnética. Notas de coentro, pau-rosa e bergamota. Um chipre floral intenso que deixa um rastro inesquecível de elegância e poder por onde passa.",
        imagem: "img/anamalefem.webp",
        secao: "alta",
        estoque: 5,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|598.00", promoPix: false }]
    },
    {
        id: "animale-m",
        marca: "ANIMALE",
        nome: "ANIMALE FOR MEN EDT",
        descricao: "Um clássico da perfumaria masculina. Notas de lavanda, junípero e gerânio sobre uma base de sândalo e couro. Refrescante, viril e ideal para o uso cotidiano no trabalho.",
        imagem: "img/animalemasc.webp",
        secao: "alta",
        estoque: 4,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|478.00", promoPix: false }]
    },
    {
        id: "silver",
        marca: "JACQUES BOGART",
        nome: "SILVER SCENT INTENSE EDT",
        descricao: "Intensidade extrema e projeção altíssima. Notas de flor de laranjeira, limão e fava tonka. Um perfume amadeirado oriental perfeito para baladas e climas frios.",
        imagem: "img/silverscent.webp",
        secao: "alta",
        estoque: 6,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|399.00", promoPix: false }]
    },
    {
        id: "ckone",
        marca: "CALVIN KLEIN",
        nome: "CK ONE ESSENCE PARFUM INTENSE",
        descricao: "Uma interpretação mais profunda do clássico atemporal. Notas de chá verde, bergamota e gengibre com fundo amadeirado. Minimalista, moderno e compartilhado (unissex).",
        imagem: "img/ckoneessence.avif",
        secao: "alta",
        estoque: 6,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|589.00", promoPix: true }]
    },
    {
        id: "azahar",
        marca: "ADOLFO DOMINGUEZ",
        nome: "ÁGUA FRESCA DE AZAHAR",
        descricao: "A leveza da flor de laranjeira em sua forma mais pura. Notas cítricas e florais que remetem à natureza e frescor. Perfeito para o clima tropical brasileiro.",
        imagem: "img/azahar.webp",
        secao: "alta",
        estoque: 4,
        disponivel: true,
        opcoes: [{ texto: "120ML", valor: "120ml|369.00", promoPix: false }]
    },
    {
        id: "hugomen",
        marca: "HUGO BOSS",
        nome: "HUGO MEN EDT",
        descricao: "O perfume do homem aventureiro. Notas de maçã verde, pinheiro e lavanda. Uma fragrância aromática verde que exala liberdade e frescor durante todo o dia.",
        imagem: "img/hugomen.avif",
        secao: "alta",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "75ML", valor: "75ml|479.00", promoPix: false }]
    },
    {
        id: "blue",
        marca: "ANTONIO BANDEIRAS",
        nome: "BLUE SEDUCTION EDT",
        descricao: "O Blue Seduction for Women, de Antonio Banderas, é a tradução líquida do frescor e da espontaneidade feminina. Esta fragrância Floral Frutada abre com uma explosão vibrante de melão, pera e bergamota, evoluindo para um coração delicado de gardênia e jasmim. O toque final de framboesa e almíscar garante uma sensualidade leve e viciante, sem perder a transparência.",
        imagem: "img/blueseduction.avif",
        secao: "alta",
        estoque: 3,
        disponivel: true,
        opcoes: [{ texto: "80ML", valor: "80ml|249.00", promoPix: false }]
    },
    {
        id: "icon",
        marca: "ANTONIO BANDEIRAS",
        nome: "THE ICON EDP",
        descricao: "Uma fragrância para quem alcançou o sucesso. Abre com pimenta preta e toranja, coração de lavanda e fundo amadeirado de musgo. Elegante, maduro e duradouro.",
        imagem: "img/theicon.webp",
        secao: "alta",
        estoque: 2,
        disponivel: true,
        opcoes: [{ texto: "200ML", valor: "200ml|379.00", promoPix: false }]
    },
    {
        id: "power",
        marca: "ANTONIO BANDEIRAS",
        nome: "POWER OF SEDUCTION",
        descricao: "Espírito jovem e esportivo. Notas de maçã, lavanda e sálvia. Uma fragrância dinâmica feita para o homem que encara desafios com confiança.",
        imagem: "img/powerseduction.avif",
        secao: "alta",
        estoque: 0,
        disponivel: false,
        opcoes: [{ texto: "100ML", valor: "100ml|0.00", promoPix: false }]
    },
    {
        id: "azzaro",
        marca: "AZZARO",
        nome: "AZZARO POUR HOMME EDT",
        descricao: "O ícone da masculinidade clássica. Fougère aromático com notas de lavanda, anis estrelado e couro. Um perfume de autoridade, respeitado mundialmente há gerações.",
        imagem: "img/azzaropourhomme.avif",
        secao: "alta",
        estoque: 7,
        disponivel: true,
        opcoes: [{ texto: "50ML", valor: "50ml|249.00", promoPix: false }]
    },
    {
        id: "clubblack",
        marca: "MERCEDES BENZ",
        nome: "MERCEDES BENZ CLUB BLACK EDT",
        descricao: "Uma joia rara da perfumaria. Baunilha intensa combinada com incenso e notas amadeiradas.",
        imagem: "img/clubblack.avif",
        secao: "alta",
        opcoes: [
            { texto: "100ML", valor: "100ml|578.00", estoque: 1, disponivel: true, promoPix: true },
            { texto: "50ML", valor: "50ml|470.00", estoque: 2, disponivel: true, promoPix: false }
        ]
    },
    {
        id: "cool",
        marca: "DAVIDOFF",
        nome: "COOL WATER DAVIDOFF EDT",
        descricao: "O pioneiro dos perfumes aquáticos. Notas de água do mar, menta e alecrim. Traz a sensação de mergulhar em um oceano gelado. Refrescante, limpo e revigorante.",
        imagem: "img/coolwater.webp",
        secao: "alta",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "125ML", valor: "125ml|289.00", promoPix: false }]
    },
    {
        id: "nautica",
        marca: "NAUTICA",
        nome: "NAUTICA VOYAGE EDT",
        descricao: "A fragrância número 1 em vendas nos EUA. Notas de maçã verde e folhas verdes. Extremamente agradável, passa uma imagem de limpeza e frescor pós-banho.",
        imagem: "img/nauticavoyage.webp",
        secao: "alta",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|199.00", promoPix: false }]
    },
    {
        id: "sabah",
        marca: "AL WATANIAH",
        nome: "SABAH AL WARD EDP",
        descricao: "Luxo árabe engarrafado. Notas de pimenta rosa e tangerina, evoluindo para um coração de cacau e jasmim. Um perfume quente, opulento e extremamente sedutor.",
        imagem: "img/SabahAlWard.jpg",
        secao: "arabe",
        estoque: 5,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|359.00", promoPix: false }]
    },
    {
        id: "bareeq",
        marca: "AL WATANIAH",
        nome: "BAREEQ AL DHAHAB EDP",
        descricao: "O esplendor do ouro. Notas de açafrão, âmbar e rosas. Uma fragrância oriental rica que exala mistério e sofisticação típica da alta perfumaria dos Emirados.",
        imagem: "img/bareeq.jpg",
        secao: "arabe",
        estoque: 3,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|359.00", promoPix: false }]
    },
    {
        id: "fakhar",
        marca: "LATTAFA",
        nome: "FAKHAR ROSE EDP",
        descricao: "Pura elegância em cada borrifada. O Fakhar Rose une o poder da tuberosa e do jasmim ao toque frutado da pera, criando um rastro doce e sofisticado. Uma fragrância tão deslumbrante quanto o seu frasco. Descubra o luxo árabe em sua forma mais feminina.",
        imagem: "img/fakharrose.webp",
        secao: "arabe",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|439.00", promoPix: false }]
    },
    {
        id: "asad-lattafa",
        marca: "LATTAFA",
        nome: "ASAD DA LATTAFA EDP",
        descricao: "Inspirado em grandes sucessos mundiais. Notas de pimenta preta, tabaco e baunilha. Um perfume especiado quente, potente e muito elogiado pelo público masculino.",
        imagem: "img/asadlattafa.webp",
        secao: "arabe",
        estoque: 3,
        disponivel: true,
        opcoes: [{ texto: "100ML", valor: "100ml|369.00", promoPix: false }]
    },
    {
        id: "kitamarillo",
        marca: "SHAKIRA",
        nome: "KIT COFFRET SHAKIRA AMARILLO",
        descricao: "O presente ideal. Inclui o perfume Shakira Amarillo 80ml + uma versão travel de 10ml. Ideal para levar na bolsa e manter-se perfumada o dia todo.",
        imagem: "img/kitshakiraamarillo.avif",
        secao: "kits",
        estoque: 6,
        disponivel: true,
        opcoes: [{ texto: "80ML+10ML", valor: "80ml+10ml|259.00", promoPix: false }]
    },
    {
        id: "coffretfucsia",
        marca: "SHAKIRA",
        nome: "KIT COFFRET SHAKIRA FUCSIA",
        descricao: "Combo de beleza completo. Contém o perfume Shakira Fucsia 80ml e um creme hidratante corporal com a mesma fragrância para potencializar a fixação.",
        imagem: "img/coffretfucsia.webp",
        secao: "kits",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "80ML+CREME", valor: "80ml+Creme|259.00", promoPix: false }]
    },
    {
        id: "kitblue",
        marca: "ANTONIO BANDEIRAS",
        nome: "KIT BLUE SEDUCTION WOMEN",
        descricao: "Praticidade e frescor. Kit com o perfume Blue Seduction 80ml mais um desodorante spray coordenado. Perfeito para o ritual de cuidados diários feminino.",
        imagem: "img/bandeirasblueseduction.webp",
        secao: "kits",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "80ML+DESOD.", valor: "80ml+DES|259.00", promoPix: false }]
    }
];
