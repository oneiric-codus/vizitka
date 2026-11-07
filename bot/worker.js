/**
 * Бот заявок Степана Семенюка — Cloudflare Worker.
 *
 * Что умеет:
 *  1. POST /lead  — принимает заявку с формы на сайте и присылает её вам в Telegram.
 *  2. POST /tg    — webhook Telegram: клиент пишет боту, выбирает услугу,
 *                   описывает задачу, а бот пересылает это вам.
 *                   Чтобы ответить клиенту, сделайте Reply (Ответить) на его заявку в боте.
 *  3. GET /setup?key=WEBHOOK_SECRET — один раз подключает бота к этому серверу.
 *
 * Переменные (Settings → Variables and Secrets):
 *  BOT_TOKEN       секрет  токен от @BotFather
 *  WEBHOOK_SECRET  секрет  любая строка из латинских букв и цифр, например k8Hq2Lm9x
 *  ADMIN_CHAT_ID   текст   ваш chat_id (бот покажет его по команде /id)
 *  ALLOWED_ORIGIN  текст   https://oneiric-codus.github.io
 *  SITE_URL        текст   адрес вашего портфолио
 */

const SERVICES = ["Сайт", "Веб-дизайн", "Telegram-бот", "Визитка", "Другое"];

const tg = (env, method, body) =>
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json()).catch(() => ({ ok: false }));

const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const cut = (s, n) => String(s ?? "").trim().slice(0, n);
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
const text = (t, status = 200) => new Response(t, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    try {
      if (url.pathname === "/lead") return await handleLead(req, env);
      if (url.pathname === "/tg" && req.method === "POST") return await handleUpdate(req, env);
      if (url.pathname === "/setup") return await setup(url, env);
      return text("Бот заявок работает.");
    } catch (e) {
      return text("Ошибка сервера", 500);
    }
  },
};

/* ---------------- заявки с сайта ---------------- */

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
}

async function handleLead(req, env) {
  const origin = req.headers.get("Origin") || "";
  const list = allowedOrigins(env);
  const okOrigin = list.length === 0 || list.includes(origin);
  const cors = {
    "Access-Control-Allow-Origin": okOrigin ? origin || "*" : list[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, cors);
  if (!okOrigin) return json({ ok: false, error: "origin" }, 403, cors);

  let d;
  try { d = await req.json(); } catch { return json({ ok: false, error: "json" }, 400, cors); }

  // Невидимое поле-ловушка: люди его не заполняют, спам-боты заполняют.
  if (d.website) return json({ ok: true }, 200, cors);

  const contact = cut(d.contact, 200);
  if (!contact) return json({ ok: false, error: "contact" }, 400, cors);

  const needs = Array.isArray(d.needs) ? d.needs.filter((x) => SERVICES.includes(x)) : [];
  const lines = [
    "🆕 <b>Заявка с сайта</b>",
    "",
    d.name && `👤 <b>Имя:</b> ${esc(cut(d.name, 100))}`,
    d.niche && `🏷 <b>Ниша:</b> ${esc(cut(d.niche, 150))}`,
    needs.length && `🧩 <b>Нужно:</b> ${esc(needs.join(", "))}`,
    `📞 <b>Связь:</b> ${esc(contact)}`,
    d.msg && `\n💬 ${esc(cut(d.msg, 2000))}`,
  ].filter(Boolean);

  const r = await tg(env, "sendMessage", {
    chat_id: env.ADMIN_CHAT_ID,
    text: lines.join("\n"),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
  return json({ ok: !!r.ok }, r.ok ? 200 : 502, cors);
}

/* ---------------- переписка с ботом ---------------- */

async function handleUpdate(req, env) {
  if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) return text("forbidden", 403);
  const u = await req.json();
  if (u.callback_query) await onCallback(u.callback_query, env);
  else if (u.message) await onMessage(u.message, env);
  return text("ok");
}

function greet(chatId, env) {
  const rows = [
    [{ text: "Сайт", callback_data: "svc:0" }, { text: "Веб-дизайн", callback_data: "svc:1" }],
    [{ text: "Telegram-бот", callback_data: "svc:2" }, { text: "Визитка", callback_data: "svc:3" }],
    [{ text: "Другое", callback_data: "svc:4" }],
  ];
  if (env.SITE_URL) rows.push([{ text: "Посмотреть мои работы ↗", url: env.SITE_URL }]);
  return tg(env, "sendMessage", {
    chat_id: chatId,
    text:
      "Здравствуйте! Я бот Степана Семенюка.\n\n" +
      "Степан делает сайты, веб-дизайн, Telegram-ботов и визитки под любую нишу.\n\n" +
      "Что вам нужно?",
    reply_markup: { inline_keyboard: rows },
  });
}

async function onCallback(q, env) {
  await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
  const m = String(q.data || "").match(/^svc:(\d)$/);
  if (!m || !q.message) return;
  const name = SERVICES[+m[1]] || "Другое";
  await tg(env, "sendMessage", {
    chat_id: q.message.chat.id,
    text:
      `Услуга: ${name}\n\n` +
      "Напишите одним сообщением: чем вы занимаетесь, что хотите получить и как с вами удобнее связаться. " +
      "Можно приложить фото или голосовое.",
    reply_markup: { force_reply: true, input_field_placeholder: "Например: кофейня, нужен сайт с меню" },
  });
}

async function onMessage(m, env) {
  if (m.chat.type !== "private") return;
  const chatId = m.chat.id;
  const body = m.text || m.caption || "";
  const isAdmin = String(chatId) === String(env.ADMIN_CHAT_ID);

  if (body.startsWith("/id")) {
    return tg(env, "sendMessage", { chat_id: chatId, text: `Ваш chat_id: <code>${chatId}</code>`, parse_mode: "HTML" });
  }

  // Степан отвечает клиенту: Reply на заявку → сообщение уходит клиенту.
  if (isAdmin) {
    const rep = m.reply_to_message;
    const hit = rep && (rep.text || rep.caption || "").match(/#id(\d+)/);
    if (hit) {
      const r = await tg(env, "copyMessage", { chat_id: hit[1], from_chat_id: chatId, message_id: m.message_id });
      return tg(env, "sendMessage", {
        chat_id: chatId,
        reply_to_message_id: m.message_id,
        text: r.ok ? "✓ Отправлено клиенту" : "Не получилось отправить: возможно, клиент заблокировал бота.",
      });
    }
    if (body.startsWith("/start")) {
      return tg(env, "sendMessage", {
        chat_id: chatId,
        text:
          "Это ваш бот заявок. Сюда приходят заявки с сайта и от клиентов, которые пишут боту.\n\n" +
          "Чтобы ответить клиенту, нажмите «Ответить» на его заявке и напишите текст.",
      });
    }
    return;
  }

  if (body.startsWith("/start")) return greet(chatId, env);

  // Сообщение клиента → заявка Степану.
  const rep = m.reply_to_message;
  const svc = rep && rep.from && rep.from.is_bot ? (rep.text || "").match(/^Услуга: (.+)$/m) : null;
  const f = m.from || {};
  const who = [f.first_name, f.last_name].filter(Boolean).join(" ") || "Без имени";
  const head = [
    "📩 <b>Заявка из бота</b>",
    "",
    `👤 <a href="tg://user?id=${f.id}">${esc(who)}</a>${f.username ? " · @" + esc(f.username) : ""}`,
    svc && `🧩 <b>Нужно:</b> ${esc(svc[1])}`,
    m.text && `\n💬 ${esc(cut(m.text, 3000))}`,
    `\n#id${chatId}  ← ответьте на это сообщение, чтобы написать клиенту`,
  ].filter(Boolean).join("\n");

  await tg(env, "sendMessage", { chat_id: env.ADMIN_CHAT_ID, text: head, parse_mode: "HTML" });
  if (!m.text) {
    // фото, голосовое, файл — пересылаем как есть
    await tg(env, "copyMessage", { chat_id: env.ADMIN_CHAT_ID, from_chat_id: chatId, message_id: m.message_id });
  }
  await tg(env, "sendMessage", {
    chat_id: chatId,
    text: "Спасибо! Заявка у Степана. Он ответит вам прямо здесь, обычно в течение дня.",
  });
}

/* ---------------- первичная настройка ---------------- */

async function setup(url, env) {
  if (!env.WEBHOOK_SECRET || url.searchParams.get("key") !== env.WEBHOOK_SECRET) {
    return text("Откройте адрес вида /setup?key=ВАШ_WEBHOOK_SECRET", 403);
  }
  const hook = await tg(env, "setWebhook", {
    url: `${url.origin}/tg`,
    secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  await tg(env, "setMyCommands", { commands: [{ command: "start", description: "Оставить заявку" }] });
  await tg(env, "setMyShortDescription", {
    short_description: "Заявки на сайты, веб-дизайн, Telegram-ботов и визитки. Степан Семенюк.",
  });
  const me = await tg(env, "getMe", {});
  return text(
    (hook.ok ? "✓ Бот подключён" : "✗ Не получилось подключить бота: " + (hook.description || "проверьте BOT_TOKEN")) +
      (me.ok ? `\nБот: @${me.result.username}` : "") +
      `\nАдрес для формы на сайте: ${url.origin}/lead` +
      (env.ADMIN_CHAT_ID ? "" : "\n\nДальше: напишите боту /id и добавьте полученное число в ADMIN_CHAT_ID.")
  );
}
