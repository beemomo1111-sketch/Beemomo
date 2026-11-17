(function () {
  "use strict";

  var PEOPLE = [
    { key: "I", zh: "我", subj: "I", adj: "my", pron: "mine", who: "指著自己的小朋友" },
    { key: "you", zh: "你／你們", subj: "you", adj: "your", pron: "yours", who: "正在聽你說話的小女孩" },
    { key: "he", zh: "他", subj: "he", adj: "his", pron: "his", who: "揮手的小男生" },
    { key: "she", zh: "她", subj: "she", adj: "her", pron: "hers", who: "笑咪咪的小女生" },
    { key: "it", zh: "它／牠", subj: "it", adj: "its", pron: "", who: "可愛的小狗" },
    { key: "we", zh: "我們", subj: "we", adj: "our", pron: "ours", who: "一起吃蘋果的好朋友（包含我）" },
    { key: "they", zh: "他們", subj: "they", adj: "their", pron: "theirs", who: "在踢足球的一群小朋友" }
  ];

  var QUESTIONS = [
    { before: "", after: " have a backpack.", who: "I", kind: "subj", zh: "我有一個背包。", pic: 0, alt: "背著背包、指著自己的小男生" },
    { before: "Look at ", after: " book.", who: "I", kind: "adj", zh: "看看我的書。", pic: 1, alt: "小女孩拿著書，指著書" },
    { before: "The yellow book is ", after: ".", who: "I", kind: "pron", zh: "這本黃色的書是我的。", pic: 2, alt: "小男生抱著黃色的書，小女孩指著書" },
    { before: "", after: " bag is on the floor.", who: "you", kind: "adj", zh: "你的包包在地板上。", pic: 3, alt: "小男生在房間裡找藍色書包" },
    { before: "This pen is ", after: ".", who: "you", kind: "pron", zh: "這支筆是你的。", pic: 4, alt: "小男生拿著筆給小女孩" },
    { before: "", after: " shirt is blue.", who: "he", kind: "adj", zh: "他的上衣是藍色的。", pic: 5, alt: "穿著藍色上衣、揮手的小男生" },
    { before: "", after: " hugs me.", who: "he", kind: "subj", zh: "他抱著我。", pic: 6, alt: "哥哥摟著弟弟" },
    { before: "", after: " holds my hand.", who: "she", kind: "subj", zh: "她牽著我的手。", pic: 7, alt: "兩個小女孩手牽手" },
    { before: "", after: " teacher is nice.", who: "she", kind: "adj", zh: "她的老師很好。", pic: 8, alt: "小女孩和微笑的老師在教室" },
    { before: "The pink bag is ", after: ".", who: "she", kind: "pron", zh: "那個粉紅色的包包是她的。", pic: 9, alt: "小女孩背著粉紅色包包，小男生指著包包" },
    { before: "", after: " nose is black.", who: "it", kind: "adj", zh: "牠的鼻子是黑色的。", pic: 10, alt: "草地上的小狗，黑色的鼻子" },
    { before: "", after: " eat apples.", who: "we", kind: "subj", zh: "我們吃蘋果。", pic: 11, alt: "三個小朋友一起吃蘋果" },
    { before: "", after: " house is pretty.", who: "we", kind: "adj", zh: "我們的房子很漂亮。", pic: 12, alt: "一家人站在漂亮的房子前面" },
    { before: "The blocks are ", after: ".", who: "we", kind: "pron", zh: "這些積木是我們的。", pic: 13, alt: "兩個小朋友坐在積木和玩具中間" },
    { before: "", after: " kick the ball.", who: "they", kind: "subj", zh: "他們在踢球。", pic: 14, alt: "一群小朋友在草地上踢球" },
    { before: "The little car is ", after: ".", who: "they", kind: "pron", zh: "那台小汽車是他們的。", pic: 15, alt: "兩個小朋友站在紅色小汽車旁邊" }
  ];

  var KIND_ZH = { subj: "主詞", adj: "所有格", pron: "所有格代名詞" };
  var PRAISE = ["太棒了！", "好厲害！", "答對了！", "你真聰明！", "完全正確！", "讚喔！"];
  var CHEER = ["差一點點！", "沒關係，再聽一次！", "加油，下一題一定可以！"];
  var TABLE_CHEER = ["差一點點！", "沒關係！", "加油！"];
  var COLORS = ["#ef5b6a", "#3b82f6", "#22a06b", "#8b5cf6", "#f97316", "#0ea5e9", "#db2777", "#0f766e"];

  var state = {
    mode: "quiz",
    seed: 7,
    idx: 0,
    picked: "",
    results: [],
    finished: false,
    fills: {},
    checked: false
  };

  function cap(s) {
    return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function person(who) {
    for (var i = 0; i < PEOPLE.length; i++) {
      if (PEOPLE[i].key === who) return PEOPLE[i];
    }
    return PEOPLE[0];
  }

  function form(p, kind) {
    if (kind === "subj") return p.subj;
    if (kind === "adj") return p.adj;
    return p.pron;
  }

  function shuffle(arr, seed) {
    var a = arr.slice();
    var s = seed;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      var j = Math.floor((s / 233280) * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function color(i) {
    return COLORS[i % COLORS.length];
  }

  function edge(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, ((n >> 16) & 255) - 48);
    var g = Math.max(0, ((n >> 8) & 255) - 48);
    var b = Math.max(0, (n & 255) - 48);
    return "#" + [r, g, b].map(function (v) {
      return v.toString(16).padStart(2, "0");
    }).join("");
  }

  function iconSrc(key) {
    return "images/icon-" + key.toLowerCase() + ".webp";
  }

  function picSrc(n) {
    return "images/pic-" + String(n).padStart(2, "0") + ".webp";
  }

  function picture(src, alt, fallbackKey) {
    var img = el("img", { src: src, alt: alt });
    img.addEventListener("error", function () {
      if (!fallbackKey || img.getAttribute("data-fallback") === "1") return;
      img.setAttribute("data-fallback", "1");
      img.src = iconSrc(fallbackKey);
    });
    return img;
  }

  // Natural recordings: en-US-JennyNeural at a slightly slow pace.
  // speechSynthesis is only used when a file cannot be played.
  var AUDIO = {
    "I have a backpack.": "audio/s-00.mp3",
    "Look at my book.": "audio/s-01.mp3",
    "The yellow book is mine.": "audio/s-02.mp3",
    "Your bag is on the floor.": "audio/s-03.mp3",
    "This pen is yours.": "audio/s-04.mp3",
    "His shirt is blue.": "audio/s-05.mp3",
    "He hugs me.": "audio/s-06.mp3",
    "She holds my hand.": "audio/s-07.mp3",
    "Her teacher is nice.": "audio/s-08.mp3",
    "The pink bag is hers.": "audio/s-09.mp3",
    "Its nose is black.": "audio/s-10.mp3",
    "We eat apples.": "audio/s-11.mp3",
    "Our house is pretty.": "audio/s-12.mp3",
    "The blocks are ours.": "audio/s-13.mp3",
    "They kick the ball.": "audio/s-14.mp3",
    "The little car is theirs.": "audio/s-15.mp3",
    "I": "audio/w-i.mp3",
    "my": "audio/w-my.mp3",
    "mine": "audio/w-mine.mp3",
    "you": "audio/w-you.mp3",
    "your": "audio/w-your.mp3",
    "yours": "audio/w-yours.mp3",
    "he": "audio/w-he.mp3",
    "his": "audio/w-his.mp3",
    "she": "audio/w-she.mp3",
    "her": "audio/w-her.mp3",
    "hers": "audio/w-hers.mp3",
    "it": "audio/w-it.mp3",
    "its": "audio/w-its.mp3",
    "we": "audio/w-we.mp3",
    "our": "audio/w-our.mp3",
    "ours": "audio/w-ours.mp3",
    "they": "audio/w-they.mp3",
    "their": "audio/w-their.mp3",
    "theirs": "audio/w-theirs.mp3",
    "I, my, mine": "audio/row-i.mp3",
    "you, your, yours": "audio/row-you.mp3",
    "he, his, his": "audio/row-he.mp3",
    "she, her, hers": "audio/row-she.mp3",
    "it, its": "audio/row-it.mp3",
    "we, our, ours": "audio/row-we.mp3",
    "they, their, theirs": "audio/row-they.mp3"
  };

  var speakToken = 0;
  var currentAudio = null;

  function fallbackSpeak(text) {
    try {
      if (!text) return;
      var synth = window.speechSynthesis;
      var Utter = window.SpeechSynthesisUtterance;
      if (!synth || typeof Utter !== "function" || typeof synth.speak !== "function") return;
      if (typeof synth.cancel === "function") synth.cancel();
      var u = new Utter(text);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1.1;
      var voices = typeof synth.getVoices === "function" ? synth.getVoices() : [];
      var v = null;
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang === "en-US") { v = voices[i]; break; }
      }
      if (!v) {
        for (var k = 0; k < voices.length; k++) {
          if (voices[k].lang && voices[k].lang.indexOf("en") === 0) { v = voices[k]; break; }
        }
      }
      if (v) u.voice = v;
      synth.speak(u);
    } catch (err) {
      // Speech is optional. Missing or blocked speech must not break the game.
    }
  }

  function speak(text) {
    try {
      if (!text) return;
      var token = ++speakToken;
      if (currentAudio) {
        try { currentAudio.pause(); } catch (pauseErr) { /* ignore */ }
        currentAudio = null;
      }
      try {
        if (window.speechSynthesis && typeof window.speechSynthesis.cancel === "function") window.speechSynthesis.cancel();
      } catch (cancelErr) { /* ignore */ }
      var src = AUDIO[text];
      if (!src || typeof Audio !== "function") {
        fallbackSpeak(text);
        return;
      }
      var audio = new Audio(src);
      currentAudio = audio;
      var usedFallback = false;
      function fail() {
        if (usedFallback || token !== speakToken) return;
        usedFallback = true;
        if (currentAudio === audio) currentAudio = null;
        fallbackSpeak(text);
      }
      audio.addEventListener("error", fail);
      var played = audio.play();
      if (played && typeof played.catch === "function") played.catch(fail);
    } catch (err) {
      fallbackSpeak(text);
    }
  }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    var props = attrs || {};
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "style") node.setAttribute("style", value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child == null || child === false) continue;
      node.appendChild(typeof child === "string" || typeof child === "number" ? document.createTextNode(String(child)) : child);
    }
    return node;
  }

  function button(label, colorHex, onClick, opts) {
    var options = opts || {};
    var classes = "fun-btn" + (options.big ? " big" : "") + (options.state ? " " + options.state : "");
    var btn = el("button", {
      type: "button",
      class: classes,
      style: "--btn:" + (options.state === "right" ? "#1b8f4a" : options.state === "wrong" ? "#e23b3b" : colorHex) + ";--btn-edge:" + edge(options.state === "right" ? "#1b8f4a" : options.state === "wrong" ? "#e23b3b" : colorHex) + ";"
    }, label);
    if (options.disabled) btn.disabled = true;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function currentOrder() {
    return shuffle(QUESTIONS, state.seed);
  }

  function answerOf(q) {
    var p = person(q.who);
    var word = form(p, q.kind);
    return q.before === "" ? cap(word) : word;
  }

  function sentenceOf(q) {
    return q.before + answerOf(q) + q.after;
  }

  function questionView(q, idx) {
    var p = person(q.who);
    var atStart = q.before === "";
    var answer = answerOf(q);
    var raw = ["subj", "adj", "pron"].map(function (kind) { return form(p, kind); }).filter(function (s) { return s !== ""; });
    var seen = {};
    var uniq = [];
    raw.forEach(function (s) {
      if (!seen[s]) {
        seen[s] = true;
        uniq.push(atStart ? cap(s) : s);
      }
    });
    return {
      q: q,
      p: p,
      answer: answer,
      full: sentenceOf(q),
      opts: shuffle(uniq, state.seed + idx)
    };
  }

  function scoreOf(results) {
    return results.filter(function (r) { return r && r.ok; }).length;
  }

  function renderFriends(parent) {
    var list = el("div", { class: "stack" });
    PEOPLE.forEach(function (pp, i) {
      var tone = color(i);
      var row = el("div", { class: "person", style: "--tone:" + tone });
      row.appendChild(el("div", { class: "avatar", style: "--tone:" + tone },
        picture(iconSrc(pp.key), pp.who, null)
      ));
      row.appendChild(el("div", { class: "who" }, pp.zh));
      var chips = el("div", { class: "chips" });
      [["subj", "主詞"], ["adj", "所有格"], ["pron", "所有格代名詞"]].forEach(function (pair) {
        var word = pp[pair[0]];
        var chip = el("button", { type: "button", class: "chip", style: "--tone:" + tone, lang: "en" });
        chip.appendChild(el("span", { class: "word" }, word || "—"));
        chip.appendChild(el("span", { class: "kind" }, pair[1]));
        chip.addEventListener("click", function () { speak(word); });
        chips.appendChild(chip);
      });
      row.appendChild(chips);
      list.appendChild(row);
    });

    parent.appendChild(el("section", { class: "section" },
      el("h2", { text: "🧸 先認識好朋友們" }),
      el("p", { class: "caption", text: "點一下英文字，就會念給你聽 🔊" }),
      list,
      el("div", { class: "callout" },
        el("strong", { text: "小訣竅 " }),
        "所有格後面一定要接東西，例如 my book；所有格代名詞自己就代表「誰的東西」，後面不接東西，例如 The book is mine. it 的所有格代名詞很少用，所以空著。"
      )
    ));
  }

  function renderModeSwitch(parent) {
    var quizTab = el("button", { type: "button", id: "tab-quiz", role: "tab", "aria-selected": "true", "aria-controls": "quiz" }, "🖼️ 看圖選擇題");
    var tableTab = el("button", { type: "button", id: "tab-table", role: "tab", "aria-selected": "false", "aria-controls": "table" }, "✏️ 填表格");
    quizTab.addEventListener("click", function () { setMode("quiz"); });
    tableTab.addEventListener("click", function () { setMode("table"); });
    parent.appendChild(el("section", { class: "section" },
      el("h2", { text: "🎮 開始玩" }),
      el("div", { class: "segmented", role: "tablist", "aria-label": "遊戲模式" }, quizTab, tableTab)
    ));
  }

  function renderQuiz() {
    var root = document.getElementById("quiz");
    if (!root) return;
    var order = currentOrder();
    var score = scoreOf(state.results);
    var heading = state.finished
      ? "🏆 全部完成！"
      : "第 " + (state.idx + 1) + " 題／共 " + order.length + " 題";
    var stars = el("div", { class: "stars", "aria-label": "答對 " + score + " 題" });
    order.forEach(function (_q, i) {
      var answered = i < state.results.length;
      var mark = el("span", { text: answered && !state.results[i].ok ? "🌱" : "⭐" });
      if (answered) mark.className = "done";
      stars.appendChild(mark);
    });

    var body;
    if (state.finished) {
      var message;
      if (score === order.length) message = "全部答對！你是代名詞小天才！";
      else if (score >= 12) message = "好厲害！再玩一次就能全對喔！";
      else message = "很棒的開始！再玩一次會更厲害！";
      var actions = el("div", { class: "actions center" });
      actions.appendChild(button("🔁 再玩一次", color(0), restart, { big: true }));
      body = el("div", { class: "card " + (score === order.length ? "success" : "accent") },
        el("p", { class: "trophy", text: "🎉🏆🎉" }),
        el("p", { class: "score-title", text: "你拿到 " + score + " 顆星星（共 " + order.length + " 題）" }),
        el("p", { class: "score-sub", text: message }),
        actions
      );
    } else {
      var view = questionView(order[state.idx], state.idx);
      var q = view.q;
      var picked = state.picked;
      var blankColor = picked ? (picked === view.answer ? "#1b8f4a" : "#e23b3b") : "#6c4ce0";
      var sentence = el("p", { class: "sentence", lang: "en" });
      sentence.appendChild(document.createTextNode(q.before));
      sentence.appendChild(el("span", { class: "blank", style: "--blank:" + blankColor, text: picked ? view.answer : "？" }));
      sentence.appendChild(document.createTextNode(q.after));

      var choices = el("div", { class: "choices" });
      view.opts.forEach(function (option, i) {
        var choiceState = "";
        if (picked) {
          if (option === view.answer) choiceState = "right";
          else if (option === picked) choiceState = "wrong";
          else choiceState = "dim";
        }
        choices.appendChild(button(option, color(i + 1), function () { choose(option, view); }, {
          big: true,
          disabled: picked !== "",
          state: choiceState
        }));
      });

      var copy = el("div", { class: "quiz-copy" },
        el("p", { class: "hint", text: "💡 " + q.zh }),
        sentence,
        el("p", { class: "kind-line", text: "要填「" + view.p.zh + "」的" + KIND_ZH[q.kind] }),
        choices
      );

      var card = el("div", { class: "card" },
        el("div", { class: "quiz-layout" },
          el("div", { class: "pic-frame", style: "--tone:" + color(state.idx) },
            picture(picSrc(q.pic), q.alt, q.who)
          ),
          copy
        )
      );

      if (picked) {
        var correct = picked === view.answer;
        var praise = correct
          ? "🎉 " + PRAISE[(state.idx + state.seed) % PRAISE.length] + " ⭐"
          : "💪 " + CHEER[(state.idx + state.seed) % CHEER.length];
        var feedback = el("div", { class: "feedback " + (correct ? "ok" : "bad"), role: "status" },
          el("p", { class: "praise", text: praise }),
          el("p", { class: "spoken", lang: "en", text: "🗣️ " + view.full })
        );
        var last = state.idx + 1 >= order.length;
        feedback.appendChild(el("div", { class: "actions" },
          button("🔊 再聽一次", color(3), function () { speak(view.full); }),
          button(last ? "🏁 看成績" : "下一題 ➜", color(0), next)
        ));
        card.appendChild(feedback);
      }
      body = card;
    }

    root.replaceChildren(
      el("h2", { text: heading }),
      stars,
      body
    );
  }

  function choose(option, view) {
    if (state.picked) return;
    state.picked = option;
    state.results = state.results.concat([{ ok: option === view.answer, q: view.q }]);
    speak(view.full);
    renderQuiz();
  }

  function next() {
    var order = currentOrder();
    state.picked = "";
    if (state.idx + 1 >= order.length) state.finished = true;
    else state.idx += 1;
    renderQuiz();
  }

  function restart() {
    state.picked = "";
    state.idx = 0;
    state.results = [];
    state.finished = false;
    state.seed += 13;
    renderQuiz();
  }

  function fillKey(personKey, which) {
    return personKey + which;
  }

  function fillOk(personKey, which, want) {
    return (state.fills[fillKey(personKey, which)] || "").trim().toLowerCase() === want;
  }

  function tableTotals() {
    var score = 0;
    var total = 0;
    PEOPLE.forEach(function (pp) {
      total += 1;
      if (fillOk(pp.key, "a", pp.adj)) score += 1;
      if (pp.pron) {
        total += 1;
        if (fillOk(pp.key, "p", pp.pron)) score += 1;
      }
    });
    return { score: score, total: total };
  }

  function renderTable() {
    var root = document.getElementById("table");
    if (!root) return;
    var grid = el("div", { class: "grid" });
    PEOPLE.forEach(function (pp, i) {
      var tone = color(i);
      var card = el("div", { class: "tcard", style: "--tone:" + tone });
      card.appendChild(el("div", { class: "tcard-head" },
        el("div", { class: "avatar sm" }, picture(iconSrc(pp.key), pp.who, null)),
        el("span", { text: pp.subj + "（" + pp.zh + "）" })
      ));
      card.appendChild(fieldBlock(pp, "a", "所有格", "例如 my", pp.adj));
      if (pp.pron) card.appendChild(fieldBlock(pp, "p", "所有格代名詞", "例如 mine", pp.pron));
      var listen = button("🔊 聽答案", tone, function () {
        speak(pp.subj + ", " + pp.adj + (pp.pron ? ", " + pp.pron : ""));
      });
      listen.setAttribute("data-listen", pp.key);
      listen.hidden = !state.checked;
      card.appendChild(listen);
      grid.appendChild(card);
    });

    var scoreSlot = el("div", { id: "table-score" });
    root.replaceChildren(
      el("h2", { text: "✏️ 把表格填完整" }),
      el("p", { class: "caption", text: "輸入英文小寫，填完按「對答案」" }),
      grid,
      el("div", { class: "actions" },
        button("✅ 對答案", color(0), function () {
          state.checked = true;
          updateTableFeedback();
        }, { big: true }),
        button("🧽 清空重來", color(2), function () {
          state.fills = {};
          state.checked = false;
          root.querySelectorAll("input").forEach(function (input) { input.value = ""; });
          updateTableFeedback();
        }, { big: true })
      ),
      scoreSlot
    );
    updateTableFeedback();
  }

  function fieldBlock(pp, which, label, placeholder, want) {
    var key = fillKey(pp.key, which);
    var input = el("input", {
      id: "fill-" + key,
      type: "text",
      autocomplete: "off",
      autocapitalize: "none",
      spellcheck: "false",
      placeholder: placeholder,
      "aria-describedby": "mark-" + key
    });
    input.value = state.fills[key] || "";
    input.addEventListener("input", function () {
      state.fills[key] = input.value;
      if (state.checked) updateTableFeedback();
    });
    var mark = el("div", {
      class: "mark",
      id: "mark-" + key,
      "data-want": want,
      "data-key": key
    });
    mark.hidden = true;
    return el("div", {},
      el("label", { class: "field", for: "fill-" + key }, label, input),
      mark
    );
  }

  function updateTableFeedback() {
    var root = document.getElementById("table");
    if (!root) return;
    root.querySelectorAll("[data-listen]").forEach(function (btn) {
      btn.hidden = !state.checked;
    });
    root.querySelectorAll(".mark").forEach(function (mark, index) {
      if (!state.checked) {
        mark.hidden = true;
        mark.className = "mark";
        mark.replaceChildren();
        return;
      }
      var typed = state.fills[mark.getAttribute("data-key")] || "";
      var want = mark.getAttribute("data-want");
      var ok = typed.trim().toLowerCase() === want;
      mark.hidden = false;
      mark.className = "mark " + (ok ? "ok" : "bad");
      if (ok) {
        mark.textContent = "⭐ 正確";
        return;
      }
      mark.replaceChildren(
        el("span", { class: "answer-line", text: "答案是 " + want }),
        el("span", { class: "answer-line", text: "💪 " + TABLE_CHEER[index % TABLE_CHEER.length] })
      );
    });
    var slot = document.getElementById("table-score");
    if (!slot) return;
    slot.replaceChildren();
    if (!state.checked) return;
    var totals = tableTotals();
    var perfect = totals.score === totals.total;
    var text = perfect
      ? "🎉 全部答對！" + totals.score + "／" + totals.total + " ⭐"
      : "答對 " + totals.score + "／" + totals.total + " ⭐";
    slot.appendChild(el("div", { class: "card " + (perfect ? "success" : "accent"), role: "status" },
      el("p", { class: "table-score", text: text })
    ));
  }

  function setMode(mode) {
    state.mode = mode;
    var quiz = document.getElementById("quiz");
    var table = document.getElementById("table");
    if (quiz) quiz.hidden = mode !== "quiz";
    if (table) table.hidden = mode !== "table";
    var quizTab = document.getElementById("tab-quiz");
    var tableTab = document.getElementById("tab-table");
    if (quizTab) quizTab.setAttribute("aria-selected", mode === "quiz" ? "true" : "false");
    if (tableTab) tableTab.setAttribute("aria-selected", mode === "table" ? "true" : "false");
  }

  function mount() {
    var app = document.getElementById("app");
    renderFriends(app);
    renderModeSwitch(app);
    app.appendChild(el("section", { class: "section", id: "quiz", role: "tabpanel" }));
    app.appendChild(el("section", { class: "section", id: "table", role: "tabpanel", hidden: true }));
    renderQuiz();
    renderTable();
    setMode("quiz");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
