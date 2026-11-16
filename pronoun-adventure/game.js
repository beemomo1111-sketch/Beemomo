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
    { before: "", after: " am a student.", who: "I", kind: "subj", zh: "我是學生。", pic: 0, alt: "背著書包的小男生指著自己" },
    { before: "This is ", after: " book.", who: "I", kind: "adj", zh: "這是我的書。", pic: 1, alt: "小女孩拿著自己的書" },
    { before: "The book is ", after: ".", who: "I", kind: "pron", zh: "這本書是我的。", pic: 2, alt: "小男生抱著書，朋友指著書" },
    { before: "Where is ", after: " bag?", who: "you", kind: "adj", zh: "你的包包在哪裡？", pic: 3, alt: "小男生在房間裡找書包" },
    { before: "Is this pen ", after: "?", who: "you", kind: "pron", zh: "這支筆是你的嗎？", pic: 4, alt: "小男生拿著一支筆問小女孩" },
    { before: "", after: " name is Tom.", who: "he", kind: "adj", zh: "他的名字是 Tom。", pic: 5, alt: "揮手打招呼的小男生" },
    { before: "", after: " is my brother.", who: "he", kind: "subj", zh: "他是我的哥哥。", pic: 6, alt: "哥哥摟著弟弟" },
    { before: "", after: " is my friend.", who: "she", kind: "subj", zh: "她是我的朋友。", pic: 7, alt: "兩個小女孩手牽手" },
    { before: "", after: " mother is a teacher.", who: "she", kind: "adj", zh: "她的媽媽是老師。", pic: 8, alt: "小女孩和當老師的媽媽在教室" },
    { before: "That bag is ", after: ".", who: "she", kind: "pron", zh: "那個包包是她的。", pic: 9, alt: "小女孩背著粉紅色包包，小男生指著包包" },
    { before: "The dog wags ", after: " tail.", who: "it", kind: "adj", zh: "小狗搖著牠的尾巴。", pic: 10, alt: "小狗在草地上搖尾巴" },
    { before: "", after: " like apples.", who: "we", kind: "subj", zh: "我們喜歡蘋果。", pic: 11, alt: "三個小朋友在吃蘋果" },
    { before: "This is ", after: " house.", who: "we", kind: "adj", zh: "這是我們的房子。", pic: 12, alt: "一家人站在自己的房子前面" },
    { before: "These toys are ", after: ".", who: "we", kind: "pron", zh: "這些玩具是我們的。", pic: 13, alt: "兩個小朋友抱著玩具" },
    { before: "", after: " are playing soccer.", who: "they", kind: "subj", zh: "他們在踢足球。", pic: 14, alt: "一群小朋友在踢足球" },
    { before: "The red car is ", after: ".", who: "they", kind: "pron", zh: "那台紅色的車是他們的。", pic: 15, alt: "兩個小朋友站在紅色汽車旁邊" }
  ];

  var KIND_ZH = { subj: "主詞", adj: "所有格", pron: "所有格代名詞" };
  var PRAISE = ["太棒了！", "好厲害！", "答對了！", "你真聰明！", "完全正確！", "讚喔！"];
  var CHEER = ["差一點點！", "沒關係，再聽一次！", "加油，下一題一定可以！"];
  var COLORS = ["#ef5b6a", "#3b82f6", "#22a06b", "#8b5cf6", "#f97316", "#0ea5e9", "#db2777", "#0f766e"];

  var state = {
    mode: "quiz",
    seed: 7,
    idx: 0,
    picked: "",
    results: [],
    finished: false,
    fills: {},
    checked: false,
    pool: null
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

  // Natural recordings: en-US-JennyNeural at a slightly slow pace.
  // speechSynthesis is only used when a file cannot be played.
  var AUDIO = {
    "I am a student.": "audio/s-00.mp3",
    "This is my book.": "audio/s-01.mp3",
    "The book is mine.": "audio/s-02.mp3",
    "Where is your bag?": "audio/s-03.mp3",
    "Is this pen yours?": "audio/s-04.mp3",
    "His name is Tom.": "audio/s-05.mp3",
    "He is my brother.": "audio/s-06.mp3",
    "She is my friend.": "audio/s-07.mp3",
    "Her mother is a teacher.": "audio/s-08.mp3",
    "That bag is hers.": "audio/s-09.mp3",
    "The dog wags its tail.": "audio/s-10.mp3",
    "We like apples.": "audio/s-11.mp3",
    "This is our house.": "audio/s-12.mp3",
    "These toys are ours.": "audio/s-13.mp3",
    "They are playing soccer.": "audio/s-14.mp3",
    "The red car is theirs.": "audio/s-15.mp3",
    "I": "audio/w-i.mp3",
    "me": "audio/w-me.mp3",
    "my": "audio/w-my.mp3",
    "mine": "audio/w-mine.mp3",
    "you": "audio/w-you.mp3",
    "your": "audio/w-your.mp3",
    "yours": "audio/w-yours.mp3",
    "he": "audio/w-he.mp3",
    "him": "audio/w-him.mp3",
    "his": "audio/w-his.mp3",
    "she": "audio/w-she.mp3",
    "her": "audio/w-her.mp3",
    "hers": "audio/w-hers.mp3",
    "it": "audio/w-it.mp3",
    "its": "audio/w-its.mp3",
    "we": "audio/w-we.mp3",
    "us": "audio/w-us.mp3",
    "our": "audio/w-our.mp3",
    "ours": "audio/w-ours.mp3",
    "they": "audio/w-they.mp3",
    "them": "audio/w-them.mp3",
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

  var QUIZ_COACH = {
    "0|my": "「My」是所有格，要貼在東西前面，例如 my book。這一題空格在句子最前面，後面接著 am，要用主詞（主格）I 當主角。正確句子：I am a student. 再看一句：I like dogs.",
    "0|mine": "「Mine」是所有格代名詞，自己代表「我的東西」，後面不接名字，例如 The book is mine. 這裡要當句子的主角，所以用主詞 I。正確句子：I am a student. 再看一句：I am happy.",
    "1|i": "「I」是主詞（主格），用來當句子的主角，例如 I am a student. 這一題 book 前面要說「誰的」，要用所有格 my，my 後面一定要接東西。正確句子：This is my book. 再看一句：This is my bag.",
    "1|mine": "「Mine」自己站著就代表「我的東西」，後面不再接 book。東西的名字前面要用所有格 my。正確句子：This is my book. 再看一句：It is my pencil.",
    "2|i": "「I」要放在句子前面當主詞，例如 I am a student. 這一題已經有主詞 The book，空格在 is 後面，要用自己站著的所有格代名詞 mine。正確句子：The book is mine. 再看一句：This bag is mine.",
    "2|my": "「My」是所有格，後面一定要接東西，例如 my book。這一題後面是句點，沒有東西了，所以用所有格代名詞 mine。正確句子：The book is mine. 再看一句：The pen is mine.",
    "3|you": "「You」是主詞（主格），例如 You are kind. 包包前面要說「你的」，要用所有格 your，your 後面要接東西。正確句子：Where is your bag? 再看一句：This is your pencil.",
    "3|yours": "「Yours」是所有格代名詞，自己代表「你的東西」，後面不接 bag。要說 your bag。正確句子：Where is your bag? 再看一句：Where is your book?",
    "4|you": "「You」是主詞，用來當主角，例如 You are my friend. 這一題是在問筆是不是「你的」，後面沒有名詞，要用所有格代名詞 yours。正確句子：Is this pen yours? 再看一句：Is this bag yours?",
    "4|your": "「Your」是所有格，後面要接東西，例如 your pen。這裡 pen 已經在前面，空格後面是問號，所以用 yours。正確句子：Is this pen yours? 再看一句：That book is yours.",
    "5|he": "「He」是主詞（主格），例如 He is my brother. 名字前面要說「他的」，要用所有格 His。正確句子：His name is Tom. 再看一句：His bag is blue.",
    "6|his": "「His」是「他的」，可以接在東西前面（his name），也可以自己站著。這一題後面是 is，要找句子的主角，用主詞 He。正確句子：He is my brother. 再看一句：He is a student.",
    "7|her": "「Her」是所有格，要放在東西前面，例如 her bag。這一題後面是 is，要用主詞（主格）She 當主角。正確句子：She is my friend. 再看一句：She is a teacher.",
    "7|hers": "「Hers」是所有格代名詞，自己代表「她的東西」，例如 The bag is hers. 這裡要找句子的主角，用主詞 She。正確句子：She is my friend. 再看一句：She likes cats.",
    "8|she": "「She」是主詞（主格），例如 She is my friend. 媽媽前面要說「她的」，要用所有格 Her。正確句子：Her mother is a teacher. 再看一句：Her bag is pink.",
    "8|hers": "「Hers」後面不接名詞，它自己就是「她的東西」。媽媽前面要用所有格 Her。正確句子：Her mother is a teacher. 再看一句：Her name is Amy.",
    "9|she": "「She」要放在句子前面當主詞，例如 She is my friend. 這一題是 That bag is ____. 已經有主詞，要用所有格代名詞 hers。正確句子：That bag is hers. 再看一句：This book is hers.",
    "9|her": "「Her」是所有格，後面要接東西，例如 her bag。這一題後面是句點，沒有東西了，所以用 hers。正確句子：That bag is hers. 再看一句：The pink bag is hers.",
    "10|it": "「It」是主詞（主格），例如 It is a dog. 尾巴前面要說「牠的」，要用所有格 its。its 沒有撇號喔。正確句子：The dog wags its tail. 再看一句：The cat licks its paw.",
    "11|our": "「Our」是所有格，要接在東西前面，例如 our house。這一題後面是 like，要用主詞（主格）We。正確句子：We like apples. 再看一句：We are friends.",
    "11|ours": "「Ours」是所有格代名詞，自己代表「我們的東西」，例如 The toys are ours. 這裡要當主角，用主詞 We。正確句子：We like apples. 再看一句：We play soccer.",
    "12|we": "「We」是主詞（主格），例如 We like apples. 房子前面要說「我們的」，要用所有格 our。正確句子：This is our house. 再看一句：This is our school.",
    "12|ours": "「Ours」後面不接 house，它自己就是「我們的東西」。要說 our house。正確句子：This is our house. 再看一句：It is our classroom.",
    "13|we": "「We」是主詞，要用在句子前面當主角，例如 We like apples. 這一題玩具已經說完，空格要用自己站著的 ours。正確句子：These toys are ours. 再看一句：This house is ours.",
    "13|our": "「Our」是所有格，後面要接東西，例如 our toys。這一題後面是句點，所以用所有格代名詞 ours。正確句子：These toys are ours. 再看一句：The books are ours.",
    "14|their": "「Their」是所有格，要放在東西前面，例如 their car。這一題後面是 are，要用主詞（主格）They。正確句子：They are playing soccer. 再看一句：They are students.",
    "14|theirs": "「Theirs」是所有格代名詞，自己代表「他們的東西」，例如 The car is theirs. 這裡要當主角，用主詞 They。正確句子：They are playing soccer. 再看一句：They like apples.",
    "15|they": "「They」是主詞（主格），例如 They are playing soccer. 這一題車子已經在前面，空格要用自己站著的 theirs。正確句子：The red car is theirs. 再看一句：These bags are theirs.",
    "15|their": "「Their」是所有格，後面要接東西，例如 their car。這一題後面是句點，所以用所有格代名詞 theirs。正確句子：The red car is theirs. 再看一句：The ball is theirs."
  };

  var KNOWN_OWNER = {
    i: "I", me: "I", my: "I", mine: "I",
    you: "you", your: "you", yours: "you",
    he: "he", him: "he", his: "he",
    she: "she", her: "she", hers: "she",
    it: "it", its: "it",
    we: "we", us: "we", our: "we", ours: "we",
    they: "they", them: "they", their: "they", theirs: "they"
  };

  var TABLE_COACH = {
    Ia: {
      fallback: "這一格是「我」的所有格，要放在東西前面。例如 This is my book. 再看一句：my bag。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「我」，所有格要貼在東西前面。例如 This is my book.",
      by: {
        i: "你寫的 I 是主詞（主格），用來當主角，例如 I am a student. 這一格要接在書、包包前面，用所有格 my。例如 my book。",
        me: "你寫的 me 是受詞，放在動作後面，例如 Mom hugs me. 這一格是所有格，後面要接東西。例如 my book。",
        mine: "你寫的 mine 是所有格代名詞，自己站著，例如 The book is mine. 這一格後面會接名詞，要用 my。例如 my pencil。"
      }
    },
    Ip: {
      fallback: "這一格是「我」的所有格代名詞，自己站著，後面不接東西。例如 The book is mine. 再看一句：This pen is mine.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「我」，自己站著時用 mine。例如 The book is mine.",
      by: {
        i: "你寫的 I 是主詞（主格），要放在句子前面，例如 I am a student. 這一格後面不接名詞，要用 mine。例如 The book is mine.",
        me: "你寫的 me 是受詞，例如 Mom hugs me. 這裡要的是「我的東西」，自己站著的 mine。例如 This bag is mine.",
        my: "你寫的 my 是所有格，後面一定要接東西，例如 my book。這一格後面不接東西，要用 mine。例如 The pen is mine."
      }
    },
    youa: {
      fallback: "這一格是「你」的所有格，要放在包包、書前面。例如 Where is your bag? 再看一句：your pencil。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「你」，所有格是 your，後面要接東西。例如 your bag。",
      by: {
        you: "你寫的 you 是主詞（主格），例如 You are kind. 包包前面要說「你的」，用所有格 your。例如 Where is your bag?",
        yours: "你寫的 yours 自己代表「你的東西」，後面不接 bag。這一格要接東西，用 your。例如 your pencil。",
        "you're": "你寫的 you're 是 you are（你是）。「你的」要寫 your，後面接東西。例如 your bag。"
      }
    },
    youp: {
      fallback: "這一格是「你」的所有格代名詞，自己代表「你的東西」。例如 Is this pen yours? 再看一句：That book is yours.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「你」，自己站著時用 yours。例如 Is this pen yours?",
      by: {
        you: "你寫的 you 是主詞（主格），例如 You are my friend. 這一格後面不接名詞，要用 yours。例如 That book is yours.",
        your: "你寫的 your 後面要接東西，例如 your pen。這一格自己站著，要用 yours。例如 Is this pen yours?",
        "you're": "你寫的 you're 是 you are（你是）。這裡要的是「你的東西」yours。例如 Is this bag yours?"
      }
    },
    hea: {
      fallback: "這一格是「他」的所有格，要放在名字或東西前面。例如 His name is Tom. 再看一句：his bag。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「他」，所有格是 his。例如 His name is Tom.",
      by: {
        he: "你寫的 he 是主詞（主格），例如 He is my brother. 名字前面要用所有格 his。例如 his bag。",
        him: "你寫的 him 是受詞，例如 I see him. 這一格是「他的」，要用 his，後面可以接名字。例如 His name is Tom."
      }
    },
    hep: {
      fallback: "這一格是「他」的所有格代名詞。他的這個字也是 his，自己站著。例如 The bag is his. 再看一句：This book is his.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「他」，自己站著時也用 his。例如 The bag is his.",
      by: {
        he: "你寫的 he 是主詞（主格），例如 He is a student. 這一格是自己站著的「他的」，他的所有格代名詞也寫 his。例如 The bag is his.",
        him: "你寫的 him 是受詞，例如 I see him. 「他的東西」自己站著時，他用的字是 his。例如 This book is his."
      }
    },
    shea: {
      fallback: "這一格是「她」的所有格，要放在人事物前面。例如 Her mother is a teacher. 再看一句：her bag。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「她」，所有格是 her，後面要接東西。例如 her bag。",
      by: {
        she: "你寫的 she 是主詞（主格），例如 She is my friend. 媽媽前面要用所有格 her。例如 Her mother is a teacher.",
        hers: "你寫的 hers 自己代表「她的東西」，後面不接名詞。這一格要接在媽媽、包包前面，用 her。例如 her bag。"
      }
    },
    shep: {
      fallback: "這一格是「她」的所有格代名詞，自己站著，後面不接東西。例如 That bag is hers. 再看一句：This book is hers.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「她」，自己站著時用 hers。例如 That bag is hers.",
      by: {
        she: "你寫的 she 是主詞（主格），例如 She is my friend. 這一格後面是空的，要用 hers。例如 This book is hers.",
        her: "你寫的 her 是所有格，後面要接東西，例如 her bag。這一格後面不接東西，要用 hers。例如 That bag is hers."
      }
    },
    ita: {
      fallback: "這一格是「它／牠」的所有格，要放在尾巴、腳前面。its 沒有撇號。例如 The dog wags its tail. 再看一句：its paw。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「它／牠」，所有格是 its，沒有撇號。例如 its tail。",
      by: {
        it: "你寫的 it 是主詞（主格），例如 It is a dog. 尾巴前面要用所有格 its，而且沒有撇號。例如 The dog wags its tail.",
        "it's": "你寫的 it's 是 it is（它是）。「牠的」沒有撇號，要寫 its。例如 its tail。",
        "its'": "多了一個撇號喔。「牠的」寫 its，沒有撇號。例如 The cat licks its paw."
      }
    },
    wea: {
      fallback: "這一格是「我們」的所有格，要放在房子、東西前面。例如 This is our house. 再看一句：our school。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「我們」，所有格是 our。例如 our house。",
      by: {
        we: "你寫的 we 是主詞（主格），例如 We like apples. 房子前面要用所有格 our。例如 This is our house.",
        us: "你寫的 us 是受詞，例如 Mom sees us. 這一格是「我們的」，要用 our，後面接東西。例如 our school。",
        ours: "你寫的 ours 自己代表「我們的東西」，後面不接 house。這一格要接東西，用 our。例如 our classroom。",
        "we're": "你寫的 we're 是 we are（我們是）。「我們的」要寫 our。例如 This is our house."
      }
    },
    wep: {
      fallback: "這一格是「我們」的所有格代名詞，自己站著。例如 These toys are ours. 再看一句：This house is ours.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「我們」，自己站著時用 ours。例如 These toys are ours.",
      by: {
        we: "你寫的 we 是主詞（主格），例如 We like apples. 這一格後面不接名詞，要用 ours。例如 This house is ours.",
        us: "你寫的 us 是受詞，例如 Mom sees us. 「我們的東西」自己站著時用 ours。例如 The toys are ours.",
        our: "你寫的 our 後面要接東西，例如 our toys。這一格後面是空的，要用 ours。例如 These toys are ours.",
        "we're": "你寫的 we're 是 we are（我們是）。這裡要的是 ours。例如 This house is ours."
      }
    },
    theya: {
      fallback: "這一格是「他們」的所有格，要放在東西前面。例如 Their car is red. 再看一句：their ball。",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「他們」，所有格是 their。例如 their ball。",
      by: {
        they: "你寫的 they 是主詞（主格），例如 They are playing soccer. 車子前面要用所有格 their。例如 Their car is red.",
        them: "你寫的 them 是受詞，例如 I see them. 這一格是「他們的」，要用 their，後面接東西。例如 their ball。",
        theirs: "你寫的 theirs 自己代表「他們的東西」，後面不接 car。這一格要接東西，用 their。例如 their ball。",
        "they're": "你寫的 they're 是 they are（他們是）。「他們的」要寫 their。例如 their car。"
      }
    },
    theyp: {
      fallback: "這一格是「他們」的所有格代名詞，自己站著。例如 The red car is theirs. 再看一句：These bags are theirs.",
      other: "你寫的 {word} 是別的朋友的字，沒關係。這一列是「他們」，自己站著時用 theirs。例如 The red car is theirs.",
      by: {
        they: "你寫的 they 是主詞（主格），例如 They are students. 這一格後面不接名詞，要用 theirs。例如 These bags are theirs.",
        them: "你寫的 them 是受詞，例如 I see them. 「他們的東西」自己站著時用 theirs。例如 The ball is theirs.",
        their: "你寫的 their 後面要接東西，例如 their car。這一格後面是空的，要用 theirs。例如 The red car is theirs.",
        "they're": "你寫的 they're 是 they are（他們是）。這裡要的是 theirs。例如 The red car is theirs."
      }
    }
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
    return shuffle(state.pool || QUESTIONS, state.seed);
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

  function quizCoach(q, chosen) {
    var key = q.pic + "|" + String(chosen || "").toLowerCase();
    return QUIZ_COACH[key] || ("我們再看一次這個空格。正確句子是：" + sentenceOf(q));
  }

  function renderFriends(parent) {
    var list = el("div", { class: "stack" });
    PEOPLE.forEach(function (pp, i) {
      var tone = color(i);
      var row = el("div", { class: "person", style: "--tone:" + tone });
      row.appendChild(el("div", { class: "avatar", style: "--tone:" + tone },
        el("img", { src: iconSrc(pp.key), alt: pp.who, width: "72", height: "72" })
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
      : (state.pool ? "錯題再練：第 " : "第 ") + (state.idx + 1) + " 題／共 " + order.length + " 題";
    var stars = el("div", { class: "stars", "aria-label": "答對 " + score + " 題" });
    order.forEach(function (_q, i) {
      var answered = i < state.results.length;
      var mark = el("span", { text: answered && !state.results[i].ok ? "🌱" : "⭐" });
      if (answered) mark.className = "done";
      stars.appendChild(mark);
    });

    var body;
    if (state.finished) {
      var missed = state.results.filter(function (r) { return r && !r.ok; });
      var message;
      if (score === order.length) {
        message = state.pool ? "錯題都練會了！你是代名詞小天才！" : "全部答對！你是代名詞小天才！";
      } else if (!state.pool && score >= 12) {
        message = "好厲害！再玩一次就能全對喔！";
      } else if (state.pool) {
        message = "很棒喔！錯題再練一次，會更厲害！";
      } else {
        message = "很棒的開始！再玩一次會更厲害！";
      }
      var actions = el("div", { class: "actions center" });
      if (missed.length) actions.appendChild(button("錯題再練一次", color(0), replayMissed, { big: true }));
      actions.appendChild(button("🔁 再玩一次", color(missed.length ? 2 : 0), restart, { big: true }));
      var finishedBits = [
        el("p", { class: "trophy", text: "🎉🏆🎉" }),
        el("p", { class: "score-title", text: "你拿到 " + score + " 顆星星（共 " + order.length + " 題）" }),
        el("p", { class: "score-sub", text: message })
      ];
      if (missed.length) {
        var missedList = el("ul", { class: "missed" });
        missed.forEach(function (r) {
          var full = sentenceOf(r.q);
          missedList.appendChild(el("li", { class: "missed-item" },
            el("img", { src: picSrc(r.q.pic), alt: r.q.alt }),
            el("div", { class: "missed-copy" },
              el("p", { class: "missed-zh", text: r.q.zh }),
              el("p", { class: "missed-en", lang: "en", text: "正確答案：" + full }),
              button("🔊 再聽一次", color(3), function () { speak(full); })
            )
          ));
        });
        finishedBits.push(el("p", { class: "missed-title", text: "這幾題可以再看一次" }));
        finishedBits.push(missedList);
      }
      finishedBits.push(actions);
      body = el.apply(null, ["div", { class: "card " + (missed.length ? "accent" : "success") }].concat(finishedBits));
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
            el("img", { src: picSrc(q.pic), alt: q.alt })
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
          el("p", { class: "praise", text: praise })
        );
        if (!correct) {
          feedback.appendChild(el("p", { class: "explain", text: quizCoach(q, picked) }));
        }
        feedback.appendChild(el("p", { class: "spoken", lang: "en", text: "🗣️ " + view.full }));
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
    state.pool = null;
    state.picked = "";
    state.idx = 0;
    state.results = [];
    state.finished = false;
    state.seed += 13;
    renderQuiz();
  }

  function replayMissed() {
    var missed = state.results.filter(function (r) { return r && !r.ok; }).map(function (r) { return r.q; });
    if (!missed.length) return;
    state.pool = missed;
    state.picked = "";
    state.idx = 0;
    state.results = [];
    state.finished = false;
    state.seed += 13;
    renderQuiz();
  }

  function tableCoach(pp, which, typed) {
    var shown = (typed || "").trim();
    var key = shown.toLowerCase();
    var cell = TABLE_COACH[pp.key + which];
    var want = which === "a" ? pp.adj : pp.pron;
    if (!cell) return "這一格的答案是 " + want + "。";
    if (cell.by && cell.by[key]) return cell.by[key];
    if (key && KNOWN_OWNER[key] && KNOWN_OWNER[key] !== pp.key) return cell.other.split("{word}").join(shown);
    return cell.fallback;
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
        el("div", { class: "avatar sm" }, el("img", { src: iconSrc(pp.key), alt: pp.who, width: "52", height: "52" })),
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
      "data-key": key,
      "data-who": pp.key,
      "data-which": which
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
    root.querySelectorAll(".mark").forEach(function (mark) {
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
      var who = mark.getAttribute("data-who");
      var which = mark.getAttribute("data-which");
      var pp = person(who);
      mark.replaceChildren(
        el("span", { class: "answer-line", text: "答案是 " + want }),
        el("span", { class: "coach", text: tableCoach(pp, which, typed) })
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
      : "答對 " + totals.score + "／" + totals.total + "，看看紅色的地方，再試一次！💪";
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
