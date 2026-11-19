/* =====================================================================
   ДАННЫЕ КАТАЛОГА — Анастасия Аблуаева, парфюм на распив, Казань
   ---------------------------------------------------------------------
   Всё, что помечено ЗАГЛУШКА, нужно заменить после разговора с ней:
   - prices:  её цены за 2 / 5 / 10 мл                         ЗАГЛУШКА
   - store:   зачёркнутая цена «в магазинах», считается сама
              как price × STORE_MARKUP (см. ниже)                ЗАГЛУШКА
   - placeholder: true  — аромата не было у неё в профиле, добавлен
              для наполнения каталога, заменить или удалить
   - check:   текст пометки, что нужно уточнить
   - nose:    парфюмер (показывается в карточке, как у Frédéric Malle)
   - photo:   когда будут фото флаконов, добавьте photo: 'img/имя.jpg'
   - occ / vibe / season: теги для теста «Найди свой аромат»
       occ:    day (каждый день), date (свидание), evening (вечер), summer (отпуск)
       vibe:   quiet (близко к коже), loud (со шлейфом), mystery (загадочно), tender (нежно)
       season: warm (весна-лето), cold (осень-зима), any (круглый год)
   ===================================================================== */

window.STORE_MARKUP = 1.25; // ЗАГЛУШКА: «экономия ~20%» относительно магазина

window.FAMILIES = [
  { id: 'all',    label: 'Все' },
  { id: 'fresh',  label: 'Свежие' },
  { id: 'floral', label: 'Цветочные' },
  { id: 'sweet',  label: 'Сладкие' },
  { id: 'wood',   label: 'Кожа и дерево' }
];

window.PERFUMES = [
  {
    id: 'soie-malaquais', brand: 'Dries Van Noten', name: 'Soie Malaquais',
    word: 'SOIE', fam: ['wood', 'sweet'],
    occ: ['evening','date'], vibe: ['mystery','quiet'], season: 'cold',
    notes: { top: 'бергамот, чёрная смородина', heart: 'роза, шёлк', base: 'каштан, какао' },
    smell: 'Шёлковое платье Дриса ван Нотена: прохладная ткань ложится на кожу, и через час это уже не духи, а второй слой кожи.',
    mood: 'Театр, долгий ужин, холодный вечер в кашемире',
    prices: [1190, 2690, 4890], // ЗАГЛУШКА,
    featured: true
  },
  {
    id: 'bijou-zafran', brand: 'Ormonde Jayne', name: 'Bijou Zafran',
    nose: 'Élodie Bernard',
    word: 'ZAFRAN', fam: ['wood'],
    occ: ['evening'], vibe: ['loud','mystery'], season: 'cold',
    notes: { top: 'шафран, груша', heart: 'ирис, сиприол, бензоин', base: 'кожа, сандал, мускус' },
    smell: 'Шафран как красное золото на коже, под ним пудровый ирис и мягкая перчаточная кожа. Тот самый «Выход в свет».',
    mood: 'Премьера, вечернее платье, важная встреча',
    prices: [1090, 2490, 4590], // ЗАГЛУШКА,
    featured: true
  },
  {
    id: 'orchidee-de-minuit', brand: 'Chloé', name: 'Orchidée de Minuit',
    nose: 'Mathieu Nardin, Cécile Matton',
    word: 'MINUIT', fam: ['sweet', 'floral'],
    occ: ['date','evening'], vibe: ['mystery','loud'], season: 'cold',
    notes: { top: 'орхидея, ром, гвоздика', heart: 'жасмин, бензоин', base: 'ваниль, пачули, мускус' },
    smell: 'Ликёрная ночная орхидея: глоток рома, сливки и тёплая ваниль. Кремово пряный, как десерт при свечах.',
    mood: 'Свидание, зимний вечер, бархат',
    prices: [690, 1590, 2890], // ЗАГЛУШКА,
    featured: true
  },
  {
    id: 'neverending', brand: 'THoO', name: 'Neverending',
    word: 'NEVER', fam: ['wood', 'floral'],
    occ: ['evening','summer'], vibe: ['loud'], season: 'any',
    notes: { top: 'розовый грейпфрут, розовый перец, мускатный орех', heart: 'тубероза, жасмин, замша', base: 'дымная древесина, амбра' },
    smell: 'Буря эмоций в одном флаконе: искрящийся грейпфрут, сливочная тубероза и замша, которая тянется до самого вечера.',
    mood: 'Концерт, вечеринка, день, когда хочется быть заметной',
    prices: [990, 2290, 4190], // ЗАГЛУШКА,
    featured: true
  },
  {
    id: 'amore-cafe', brand: 'Mancera', name: 'Amore Café',
    word: 'CAFÉ', fam: ['sweet'],
    occ: ['day','date'], vibe: ['tender','quiet'], season: 'cold',
    notes: { top: 'эспрессо', heart: 'амаретто', base: 'ванильное мороженое' },
    smell: 'Свидание в кофейне: горячий эспрессо, капля амаретто и шарик ванильного мороженого, который тает рядом с чашкой.',
    mood: 'Утро выходного, кофейня, уютный свитер',
    prices: [590, 1290, 2390], // ЗАГЛУШКА,
    featured: true
  },
  {
    id: 'osmanthus', brand: 'Acqua di Parma', name: 'Osmanthus',
    word: 'OSMANTHE', fam: ['fresh', 'floral'],
    occ: ['day','summer'], vibe: ['tender','quiet'], season: 'warm',
    notes: { top: 'зелёный мандарин, нероли', heart: 'пион, османтус', base: 'пачули' },
    smell: 'Прогулка в парке: абрикосовый цветок османтуса, сочный мандарин и лёгкий пион. Солнечно, но без сахара.',
    mood: 'Весенний день, пикник, светлый тренч',
    prices: [790, 1790, 3290], // ЗАГЛУШКА
  },
  {
    id: 'molecule-ginger', brand: 'Escentric Molecules', name: 'Molecule 01 + Ginger',
    nose: 'Geza Schoen',
    word: 'GINGER', fam: ['fresh'],
    occ: ['day'], vibe: ['quiet'], season: 'any',
    notes: { top: 'имбирь', heart: 'амбретта', base: 'Iso E Super' },
    smell: 'Чистая бархатная древесина, которая звучит по разному на каждой коже, и острая искра свежего имбиря.',
    mood: 'Офис, путешествие, каждый день',
    prices: [1090, 2190, 3590], // ЗАГЛУШКА (в профиле было 1 080 / 2 100 / 3 500, цены старые)
  },
  {
    id: 'ego-stratis', brand: 'Juliette Has a Gun', name: 'Ego Stratis',
    word: 'EGO', fam: ['fresh'],
    occ: ['day','summer'], vibe: ['quiet'], season: 'warm',
    notes: { top: 'лимон, мандарин, бергамот', heart: 'черника, нероли, морские ноты', base: 'мускус, кедр, амброкс' },
    smell: 'Прозрачная свежесть: лимонная корка, черника и чистый мускус. Пахнет как белая рубашка после моря.',
    mood: 'Лето, спорт, утро понедельника',
    prices: [590, 1290, 1890], // ЗАГЛУШКА (в профиле было 580 / 1 230 / 1 850)
  },
  {
    id: 'per-se', brand: '27 87', name: 'Per Sē',
    nose: 'Shyamala Maisondieu',
    word: 'PER SĒ', fam: ['floral'],
    occ: ['day'], vibe: ['quiet','tender'], season: 'any',
    check: 'Название определено по нотам из её поста, уточнить',
    notes: { top: 'альдегиды, розовый перец', heart: 'фиалка, ирис', base: 'амбретта, мускус, кедр' },
    smell: 'Альдегидная пена и пудровая фиалка с ирисом. Чисто, светло и очень интеллигентно, как свежее бельё на солнце.',
    mood: 'Галерея, книжный магазин, белая блузка',
    prices: [790, 1590, 2590], // ЗАГЛУШКА (в профиле было 750 / 1 500 / 2 500)
  },
  {
    id: 'violetta', brand: "Penhaligon's", name: 'Violetta',
    nose: 'Michael Pickthall',
    word: 'VIOLETTA', fam: ['floral'],
    occ: ['day'], vibe: ['tender','quiet'], season: 'warm',
    check: 'Предположительно Violetta («прозрачная фиалка»), уточнить',
    notes: { top: 'герань, цитрусы', heart: 'фиалка', base: 'сандал, кедр, мускус' },
    smell: 'Прозрачная английская фиалка: росистые лепестки, зелёный стебель и тонкое дерево. Никакой конфетности.',
    mood: 'Дождливый день, кофе с книгой, шерстяное пальто',
    prices: [590, 1290, 2290], // ЗАГЛУШКА
  },
  {
    id: 'ombre-leather', brand: 'Tom Ford', name: 'Ombré Leather',
    nose: 'Sonia Constant',
    word: 'LEATHER', fam: ['wood'],
    occ: ['evening','day'], vibe: ['loud','mystery'], season: 'cold',
    notes: { top: 'кардамон', heart: 'кожа, жасмин самбак', base: 'амбра, мох, пачули' },
    smell: 'Мягкая кожаная куртка, нагретая солнцем пустыни: пряный кардамон, замша и сухой мох.',
    mood: 'Дорога, осень, кожаная куртка',
    prices: [690, 1490, 2690], // ЗАГЛУШКА
  },
  {
    id: 'blanche', brand: 'Byredo', name: 'Blanche',
    nose: 'Jérôme Epinette',
    word: 'BLANCHE', fam: ['fresh', 'floral'],
    occ: ['day','date'], vibe: ['quiet','tender'], season: 'warm',
    notes: { top: 'альдегиды, белая роза, розовый перец', heart: 'пион, нероли, фиалка', base: 'светлая древесина, мускус' },
    smell: 'Белое хлопковое бельё, высохшее на ветру. Чистота, в которой есть характер.',
    mood: 'Утро, свидание без повода, белая рубашка',
    prices: [890, 1990, 3590], // ЗАГЛУШКА
  },
  {
    id: 'coco-mademoiselle', brand: 'Chanel', name: 'Coco Mademoiselle',
    nose: 'Jacques Polge',
    word: 'COCO', fam: ['floral'],
    occ: ['day','evening'], vibe: ['loud'], season: 'any', placeholder: true,
    check: 'Был у неё полным флаконом, уточнить, есть ли на распив',
    notes: { top: 'апельсин, бергамот', heart: 'роза, жасмин', base: 'пачули, ветивер, ваниль' },
    smell: 'Классика, которая не стареет: искристый апельсин, роза и пачули. Собранная и очень женственная.',
    mood: 'Офис, ужин, каждый день, когда нужна уверенность',
    prices: [790, 1690, 3090], // ЗАГЛУШКА
  },
  {
    id: 'kirke', brand: 'Tiziana Terenzi', name: 'Kirke',
    word: 'KIRKE', fam: ['sweet'],
    occ: ['summer','date'], vibe: ['loud'], season: 'warm', placeholder: true,
    check: 'Был у неё полным флаконом, уточнить, есть ли на распив',
    notes: { top: 'маракуйя, персик, малина', heart: 'ландыш, груша', base: 'мускус, сандал, ваниль' },
    smell: 'Сочный фруктовый коктейль на мускусной подушке. Шлейф, о котором спрашивают в лифте.',
    mood: 'Вечеринка, отпуск, яркое платье',
    prices: [590, 1290, 2390], // ЗАГЛУШКА
  },
  {
    id: 'linterdit', brand: 'Givenchy', name: "L'Interdit",
    nose: 'Dominique Ropion, Fanny Bal, Anne Flipo',
    word: 'INTERDIT', fam: ['floral', 'sweet'],
    occ: ['evening','date'], vibe: ['mystery'], season: 'any', placeholder: true,
    check: 'Был у неё полным флаконом, уточнить, есть ли на распив',
    notes: { top: 'груша, бергамот', heart: 'тубероза, флёрдоранж, жасмин', base: 'пачули, ветивер, амбра' },
    smell: 'Белые цветы с тёмной стороной: сладкая тубероза, а под ней дымный пачули. Запретно и очень красиво.',
    mood: 'Вечер, маленькое чёрное платье',
    prices: [590, 1290, 2290], // ЗАГЛУШКА
  },
  {
    id: 'br540', brand: 'Maison Francis Kurkdjian', name: 'Baccarat Rouge 540',
    nose: 'Francis Kurkdjian',
    word: 'ROUGE', fam: ['sweet', 'wood'],
    occ: ['evening','date'], vibe: ['loud','mystery'], season: 'any', placeholder: true,
    notes: { top: 'шафран, жасмин', heart: 'амбровое дерево', base: 'кедр, смола ели' },
    smell: 'Жжёный сахар и сияющая амбра. Аромат, который все узнают, но каждый слышит по своему.',
    mood: 'Праздник, вечер, когда хочется сиять',
    prices: [1490, 3390, 6290], // ЗАГЛУШКА
  },
  {
    id: 'santal-33', brand: 'Le Labo', name: 'Santal 33',
    nose: 'Frank Voelkl',
    word: 'SANTAL', fam: ['wood'],
    occ: ['day'], vibe: ['mystery','quiet'], season: 'cold', placeholder: true,
    notes: { top: 'кардамон, фиалка', heart: 'ирис, папирус', base: 'сандал, кедр, кожа' },
    smell: 'Сухой сандал, кожаный ремень и костёр где то вдалеке. Тёплый, спокойный, немного дикий.',
    mood: 'Путешествие, выходные за городом, свитер оверсайз',
    prices: [1190, 2690, 4890], // ЗАГЛУШКА
  },
  {
    id: 'love-dont-be-shy', brand: 'Kilian', name: "Love, Don't Be Shy",
    nose: 'Calice Becker',
    word: 'LOVE', fam: ['sweet'],
    occ: ['date'], vibe: ['tender','loud'], season: 'cold', placeholder: true,
    notes: { top: 'нероли, розовый перец, бергамот', heart: 'флёрдоранж, жасмин, ирис', base: 'ваниль, маршмеллоу, мускус' },
    smell: 'Воздушный зефир с флёрдоранжем: нежно, сладко и немного кокетливо.',
    mood: 'Свидание, день рождения, пижамная вечеринка',
    prices: [1190, 2690, 4990], // ЗАГЛУШКА
  }
];

/* Аромабокс «Осенний сюжет» — состав и цены из её поста (прошлый бокс) */
window.BOX = {
  id: 'box-autumn',
  title: 'Осенний сюжет',
  sub: '4 аромата в отливантах, каждый со своей историей',
  items: [
    { id: 'bijou-zafran', scene: 'Выход в свет', notes: 'шафран, ирис, кожа' },
    { id: 'osmanthus', scene: 'Прогулка в парке', notes: 'зелёный мандарин, пион, османтус' },
    { id: 'amore-cafe', scene: 'Свидание в кофейне', notes: 'эспрессо, ванильное мороженое, амаретто' },
    { id: 'neverending', scene: 'Буря эмоций', notes: 'грейпфрут, розовый перец, тубероза, замша' }
  ],
  prices: [2300, 4900, 8300],   // из её поста
  was:    [2700, 5700, 9700]    // из её поста
};

/* Услуги. Цены неизвестны: показываем «по запросу» (ЗАГЛУШКА) */
window.SERVICES = [
  {
    id: 'svc-wardrobe', title: 'Парфюмерный гардероб', kind: 'Индивидуальная консультация',
    text: 'Встреча вживую: тест на ассоциации, разговор о вашем образе жизни и истории ароматов. В итоге вы получаете подобранный гардероб из нескольких ароматов на разные случаи.',
    meta: ['Вживую, Казань', 'Отзывы клиенток в её Instagram'],
    price: 'по запросу' // ЗАГЛУШКА
  },
  {
    id: 'svc-detective', title: 'Парфюмерный детектив', kind: 'Авторская игра',
    text: 'Восемь флаконов и одна задача: угадать ароматы. Для дня рождения, девичника, корпоратива, свидания или вечера с друзьями. Проводила в Kuji Sushi и в Иннополисе.',
    meta: ['8 флаконов', 'Компания или пара'],
    price: 'по запросу' // ЗАГЛУШКА
  },
  {
    id: 'svc-masterclass', title: 'Мастер-классы', kind: 'Для групп',
    text: 'Знакомство с парфюмерией вживую: как устроен аромат, как читать ноты и как выбирать свой. Формат и тему подберём под вашу компанию.',
    meta: ['Группа', 'Формат обсуждаем'],
    price: 'по запросу' // ЗАГЛУШКА
  }
];
