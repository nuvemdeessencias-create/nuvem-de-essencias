const meusProdutos = [
    {
        id: "fucsia",
        marca: "SHAKIRA",
        nome: "SHAKIRA FUCSIA EDP",
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
        imagem: "img/bandeirasblueseduction.webp",
        secao: "kits",
        estoque: 1,
        disponivel: true,
        opcoes: [{ texto: "80ML + DESOD. - R$ 259,00", valor: "80ml+DES|259.00" }]
    }
];
