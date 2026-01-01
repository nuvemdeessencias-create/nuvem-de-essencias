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
        opcoes: [{ texto: "80ML - R$ 239,00", valor: "80ml|239.00" }]
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
        opcoes: [{ texto: "80ML - R$ 239,00", valor: "80ml|239.00" }]
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
        opcoes: [{ texto: "80ML - INDISPONÍVEL", valor: "80ml|0.00" }]
    },
    {
        id: "chloe",
        marca: "CHLOE",
        nome: "CHLOÉ EDP",
        descricao: "O clássico da sofisticação. Notas de rosa damascena, peônia e lichia. É um perfume floral leve e refrescante, que traduz a elegância natural e o luxo moderno da marca francesa.",
        imagem: "img/chloedp.avif",
        secao: "alta",
        estoque: 7,
        disponivel: true,
        opcoes: [
            { texto: "50ML (2 unidades) - R$ 809,00", valor: "50ml|809.00" },
            { texto: "75ML (5 unidades) - R$ 939,00", valor: "75ml|939.00" }
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
        opcoes: [{ texto: "60ML - R$ 169,00", valor: "60ml|169.00" }]
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
        opcoes: [{ texto: "80ML - R$ 869,00", valor: "80ml|869.00" }]
    },
    {
        id: "invictus",
        marca: "PACO RABANNE",
        nome: "INVICTUS EDT",
        descricao: "A essência da vitória. Notas oceânicas, toranja e folhas de louro. Um perfume amadeirado aquático que exala frescor e sensualidade para o homem moderno e competitivo.",
        imagem: "img/invictus.jpg",
        secao: "alta",
        estoque: 0,
        disponivel: false,
        opcoes: [{ texto: "100ML - ESGOTADO", valor: "100ml|0.00" }]
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
        opcoes: [{ texto: "100ML - INDISPONÍVEL", valor: "100ml|0.00" }]
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
        opcoes: [{ texto: "100ML - R$ 598,00", valor: "100ml|598.00" }]
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
        opcoes: [{ texto: "100ML - R$ 478,00", valor: "100ml|478.00" }]
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
        opcoes: [{ texto: "100ML - R$ 399,00", valor: "100ml|399.00" }]
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
        opcoes: [{ texto: "100ML - R$ 589,00", valor: "100ml|589.00" }]
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
        opcoes: [{ texto: "120ML - R$ 369,00", valor: "120ml|369.00" }]
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
        opcoes: [{ texto: "75ML - R$ 479,00", valor: "75ml|479.00" }]
    },
    {
        id: "blue",
        marca: "ANTONIO BANDEIRAS",
        nome: "BLUE SEDUCTION EDT",
        descricao: "Fresco, moderno e extremamente sedutor. Notas de melão, bergamota e menta. Um perfume aquático transparente que equilibra jovialidade e elegância masculina.",
        imagem: "img/blueseduction.avif",
        secao: "alta",
        estoque: 3,
        disponivel: true,
        opcoes: [{ texto: "80ML - R$ 249,00", valor: "80ml|249.00" }]
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
        opcoes: [{ texto: "200ML - R$ 379,00", valor: "200ml|379.00" }]
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
        opcoes: [{ texto: "100ML - ESGOTADO", valor: "100ml|0.00" }]
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
        opcoes: [
            { texto: "50ML - R$ 249,00", valor: "50ml|249.00" }
        ]
    },
    {
        id: "clubblack",
        marca: "MERCEDES BENZ",
        nome: "MERCEDES BENZ CLUB BLACK EDT",
        descricao: "Uma joia rara da perfumaria. Baunilha intensa combinada com incenso e notas amadeiradas. Elegante, noturno e com uma fixação extraordinária. Um verdadeiro item de colecionador.",
        imagem: "img/clubblack.avif",
        secao: "alta",
        estoque: 3,
        disponivel: true,
        opcoes: [
            { texto: "100ML - R$ 578,00 (2 unid.)", valor: "100ml|578.00" },
            { texto: "50ML - R$ 470,00 (1 unid.)", valor: "50ml|470.00" }
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
        opcoes: [{ texto: "125ML - R$ 289,00", valor: "125ml|289.00" }]
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
        opcoes: [{ texto: "100ML - R$ 199,00", valor: "100ml|199.00" }]
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
        opcoes: [{ texto: "100ML - R$ 359,00", valor: "100ml|359.00" }]
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
        opcoes: [{ texto: "100ML - R$ 359,00", valor: "100ml|359.00" }]
    },
    {
        id: "fakhar",
        marca: "LATTAFA",
        nome: "FAKHAR ROSE EDP",
        descricao: "Uma ode à feminilidade árabe. Buquê de rosas, jasmim e tuberosa com um toque de pera. Doce na medida certa, elegante e com uma embalagem deslumbrante.",
        imagem: "img/fakharrose.webp",
        secao: "arabe",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "100ML - R$ 439,00", valor: "100ml|439.00" }]
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
        opcoes: [{ texto: "100ML - R$ 369,00", valor: "100ml|369.00" }]
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
        opcoes: [{ texto: "80ML+10ML - R$ 259,00", valor: "80ml+10ml|259.00" }]
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
        opcoes: [{ texto: "80ML + CREME - R$ 259,00", valor: "80ml+Creme|259.00" }]
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
        opcoes: [{ texto: "80ML + DESOD. - R$ 259,00", valor: "80ml+DES|259.00" }]
    }
];
