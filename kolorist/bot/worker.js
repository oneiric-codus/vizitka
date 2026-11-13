/**
 * Бот записи на курс «Колорист с нуля» — Cloudflare Worker.
 *
 *  POST /lead   заявка со страницы курса → Юлии в Telegram
 *  POST /tg     webhook Telegram: ученица пишет боту, смотрит программу и цену, записывается
 *  GET  /setup  подключает бота к этому Worker (можно открывать сколько угодно раз)
 *
 * Переменные (Settings → Variables and Secrets):
 *  BOT_TOKEN       секрет  токен от @BotFather
 *  ADMIN_CHAT_ID   текст   chat_id, куда слать заявки. Можно несколько через запятую
 *                          (например, Юлия и Степан). Бот покажет chat_id по команде /id
 * Необязательные: ALLOWED_ORIGIN, SITE_URL.
 */

const DEFAULT_ORIGIN = "https://oneiric-codus.github.io";
const DEFAULT_SITE = "https://oneiric-codus.github.io/vizitka/kolorist/";

/* ---- данные курса: меняйте здесь ---- */
const COURSE = {
  title: "Колорист с нуля",
  start: "23 ноября",
  seats: 2,
  price: "50 000 ₽",
  early: "40 000 ₽",
  address: "Уфа, Сипайлово, ул. Юрия Гагарина, 36",
};
const PROGRAM =
  "<b>7 дней, офлайн, индивидуально</b>\n\n" +
  "1 — теория цвета и уровни тона\n" +
  "2 — красители, оксиды, пропорции\n" +
  "3 — окрашивание в один тон\n" +
  "4 — осветление и тонирование\n" +
  "5 — сложное окрашивание\n" +
  "6 — выход из чёрного\n" +
  "7 — работа на модели и портфолио\n\n" +
  "Отработка на моделях — по 2 человека.";
const PRICE =
  `<b>${COURSE.price}</b> — полная стоимость.\n<b>${COURSE.early}</b> — при раннем бронировании, скидка 10 000 ₽.\n\n` +
  "Входит: сертификат, список материалов, контакты менеджеров для закупа и поддержка 6 месяцев после курса.\n" +
  "Рассрочки нет.";
const FAQ = {
  exp: "Опыт не нужен. Курс начинается с самой базы — теории цвета и уровней тона.",
  where: `Обучение проходит офлайн: <b>${COURSE.address}</b>.`,
  pay: `Рассрочки нет. При раннем бронировании курс стоит ${COURSE.early} вместо ${COURSE.price}. Место закрепляется предоплатой.`,
  after: "После курса — сертификат, список материалов, контакты закупа и полгода поддержки: присылаете работы и задаёте вопросы.",
};

/* ---- служебное ---- */
async function hookSecret(env) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hook:" + env.BOT_TOKEN));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 48);
}
const tg = (env, method, body) =>
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json()).catch(() => ({ ok: false }));
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const cut = (s, n) => String(s ?? "").trim().slice(0, n);
const admins = (env) => String(env.ADMIN_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
const text = (t, status = 200) => new Response(t, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

async function toAdmins(env, body) {
  let ok = false;
  for (const id of admins(env)) {
    const r = await tg(env, "sendMessage", { chat_id: id, parse_mode: "HTML", link_preview_options: { is_disabled: true }, ...body });
    ok = ok || !!r.ok;
  }
  return ok;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    try {
      if (url.pathname === "/lead") return await handleLead(req, env);
      if (url.pathname === "/tg" && req.method === "POST") return await handleUpdate(req, env);
      if (url.pathname === "/setup") return await setup(url, env);
      return text("Бот записи на курс работает.");
    } catch (e) {
      return text("Ошибка сервера", 500);
    }
  },
};

/* ---------------- заявка со страницы ---------------- */

async function handleLead(req, env) {
  const origin = req.headers.get("Origin") || "";
  const list = String(env.ALLOWED_ORIGIN || DEFAULT_ORIGIN).split(",").map((s) => s.trim()).filter(Boolean);
  const okOrigin = list.includes(origin);
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? origin : list[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ ok: false }, 405, cors);
  if (!okOrigin) return json({ ok: false, error: "origin" }, 403, cors);

  let d;
  try { d = await req.json(); } catch { return json({ ok: false }, 400, cors); }
  if (d.website) return json({ ok: true }, 200, cors); // ловушка для спам-ботов

  const name = cut(d.name, 60), phone = cut(d.phone, 30);
  if (!name || phone.replace(/\D/g, "").length < 10) return json({ ok: false, error: "fields" }, 400, cors);

  const ok = await toAdmins(env, {
    text: [
      "🌹 <b>Новая запись на курс</b>",
      "",
      `👤 <b>Имя:</b> ${esc(name)}`,
      `📞 <b>Телефон:</b> ${esc(phone)}`,
      `📅 <b>Поток:</b> ${COURSE.start}`,
      `💳 <b>Цена:</b> ${COURSE.early} (раннее бронирование)`,
      "",
      "Источник: страница курса. Позвоните или напишите ученице, чтобы отправить реквизиты для предоплаты.",
    ].join("\n"),
  });
  return json({ ok }, ok ? 200 : 502, cors);
}

/* ---------------- переписка с ботом ---------------- */

async function handleUpdate(req, env) {
  if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== (await hookSecret(env))) return text("forbidden", 403);
  const u = await req.json();
  if (u.callback_query) await onCallback(u.callback_query, env);
  else if (u.message) await onMessage(u.message, env);
  return text("ok");
}

const MENU = {
  inline_keyboard: [
    [{ text: `Записаться на ${COURSE.start}`, callback_data: "book" }],
    [{ text: "Программа", callback_data: "prog" }, { text: "Стоимость", callback_data: "price" }],
    [{ text: "Частые вопросы", callback_data: "faq" }],
  ],
};
const BACK = (extra = []) => ({ inline_keyboard: [...extra, [{ text: "← В меню", callback_data: "menu" }]] });
const BOOK_BTN = [{ text: `Записаться за ${COURSE.early}`, callback_data: "book" }];

function menu(chatId, env) {
  return tg(env, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text:
      "Здравствуйте! Я помощник Юлии 🌹\n" +
      `Здесь можно узнать всё о курсе <b>«${COURSE.title}»</b> и забронировать место.\n\n` +
      `Ближайший старт — <b>${COURSE.start}</b>, мест всего <b>${COURSE.seats}</b>.`,
    reply_markup: MENU,
  });
}

function askContact(chatId, env) {
  return tg(env, "sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text:
      `Отлично! Поток <b>${COURSE.start}</b>.\n\n` +
      "Нажмите кнопку «Отправить номер» внизу — Юлия свяжется с вами и пришлёт реквизиты для предоплаты.\n" +
      "Или напишите имя и телефон одним сообщением.",
    reply_markup: {
      keyboard: [[{ text: "📱 Отправить номер", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
      input_field_placeholder: "Анна, +7 917 123-45-67",
    },
  });
}

async function onCallback(q, env) {
  await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
  if (!q.message) return;
  const chatId = q.message.chat.id;
  const d = q.data || "";
  const send = (t, markup) => tg(env, "sendMessage", { chat_id: chatId, text: t, parse_mode: "HTML", reply_markup: markup });
  if (d === "menu") return menu(chatId, env);
  if (d === "book") return askContact(chatId, env);
  if (d === "prog") return send(PROGRAM, BACK([BOOK_BTN]));
  if (d === "price") return send(PRICE, BACK([BOOK_BTN]));
  if (d === "faq")
    return send("Выберите вопрос:", BACK([
      [{ text: "Нужен ли опыт?", callback_data: "f:exp" }, { text: "Где проходит?", callback_data: "f:where" }],
      [{ text: "Есть рассрочка?", callback_data: "f:pay" }, { text: "Что после курса?", callback_data: "f:after" }],
    ]));
  const f = d.match(/^f:(\w+)$/);
  if (f && FAQ[f[1]]) return send(FAQ[f[1]], BACK([[{ text: "Другие вопросы", callback_data: "faq" }], BOOK_BTN]));
}

async function onMessage(m, env) {
  if (m.chat.type !== "private") return;
  const chatId = m.chat.id;
  const body = m.text || m.caption || "";
  const isAdmin = admins(env).includes(String(chatId));

  if (body.startsWith("/id"))
    return tg(env, "sendMessage", { chat_id: chatId, text: `Ваш chat_id: <code>${chatId}</code>`, parse_mode: "HTML" });

  // Юлия отвечает ученице: «Ответить» на заявку → сообщение уходит ученице
  if (isAdmin) {
    const rep = m.reply_to_message;
    const hit = rep && (rep.text || rep.caption || "").match(/#id(\d+)/);
    if (hit) {
      const r = await tg(env, "copyMessage", { chat_id: hit[1], from_chat_id: chatId, message_id: m.message_id });
      return tg(env, "sendMessage", {
        chat_id: chatId,
        reply_to_message_id: m.message_id,
        text: r.ok ? "✓ Отправлено ученице" : "Не получилось отправить: возможно, ученица заблокировала бота.",
      });
    }
    if (body.startsWith("/start"))
      return tg(env, "sendMessage", {
        chat_id: chatId,
        text: "Это ваш бот записи. Сюда приходят заявки со страницы курса и от учениц, которые пишут боту.\n\nЧтобы ответить ученице, нажмите «Ответить» на её заявке и напишите текст.",
      });
    return;
  }

  if (body.startsWith("/start")) return menu(chatId, env);

  const f = m.from || {};
  const who = [f.first_name, f.last_name].filter(Boolean).join(" ") || "Без имени";
  const profile = `<a href="tg://user?id=${f.id}">${esc(who)}</a>${f.username ? " · @" + esc(f.username) : ""}`;

  // запись: контакт кнопкой или текст с телефоном
  const phone = m.contact ? m.contact.phone_number : (body.match(/\+?\d[\d\s()-]{8,}\d/) || [])[0];
  if (phone) {
    const name = m.contact ? [m.contact.first_name, m.contact.last_name].filter(Boolean).join(" ") : cut(body.replace(phone, "").replace(/[,.;]+$/,""), 60) || who;
    await toAdmins(env, {
      text: [
        "🌹 <b>Новая запись на курс</b>",
        "",
        `👤 <b>Имя:</b> ${esc(name)}`,
        `📞 <b>Телефон:</b> ${esc(phone)}`,
        `💬 <b>Telegram:</b> ${profile}`,
        `📅 <b>Поток:</b> ${COURSE.start}`,
        `💳 <b>Цена:</b> ${COURSE.early} (раннее бронирование)`,
        `\n#id${chatId}  ← ответьте на это сообщение, чтобы написать ученице`,
      ].join("\n"),
    });
    return tg(env, "sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text:
        `Спасибо, ${esc(name.split(" ")[0])}! Заявка у Юлии 🙌\n\n` +
        `Она свяжется с вами и пришлёт реквизиты для предоплаты — она закрепит место и цену <b>${COURSE.early}</b>.\n\n` +
        `Адрес: ${COURSE.address}`,
      reply_markup: { remove_keyboard: true },
    });
  }

  // любой другой вопрос → Юлии
  await toAdmins(env, {
    text: ["💬 <b>Вопрос из бота</b>", "", `👤 ${profile}`, body && `\n${esc(cut(body, 3000))}`, `\n#id${chatId}  ← ответьте, чтобы написать ученице`].filter(Boolean).join("\n"),
  });
  if (!m.text) for (const id of admins(env)) await tg(env, "copyMessage", { chat_id: id, from_chat_id: chatId, message_id: m.message_id });
  return tg(env, "sendMessage", { chat_id: chatId, text: "Передала ваш вопрос Юлии, она ответит прямо здесь.", reply_markup: MENU });
}

/* ---------------- первичная настройка ---------------- */

async function setup(url, env) {
  if (!env.BOT_TOKEN) return text("Сначала добавьте секрет BOT_TOKEN в настройках Worker.", 400);
  const hook = await tg(env, "setWebhook", {
    url: `${url.origin}/tg`,
    secret_token: await hookSecret(env),
    allowed_updates: ["message", "callback_query"],
  });
  await tg(env, "setMyCommands", { commands: [{ command: "start", description: "Меню курса" }] });
  await tg(env, "setMyShortDescription", { short_description: `Запись на курс «${COURSE.title}» · Уфа · старт ${COURSE.start}` });
  await tg(env, "setMyDescription", {
    description: `Помощник Юлии: программа, цена и запись на авторский курс «${COURSE.title}». Нажмите «Старт».`,
  });
  const me = await tg(env, "getMe", {});
  return text(
    (hook.ok ? "✓ Бот подключён" : "✗ Не получилось подключить бота: " + (hook.description || "проверьте BOT_TOKEN")) +
      (me.ok ? `\nБот: @${me.result.username}` : "") +
      `\nАдрес для страницы курса: ${url.origin}/lead` +
      (admins(env).length ? "" : "\n\nДальше: напишите боту /id и добавьте полученное число в ADMIN_CHAT_ID.")
  );
}
