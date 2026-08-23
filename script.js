document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const PIN = "2016";
  const state = { snakeCorruption:false, memorySnap:false };

  const $ = id => document.getElementById(id);
  const screens = {
    home:$("homeScreen"), snake:$("snakeGame"),
    reaction:$("reactionGame"), memory:$("memoryGame")
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
    if (name === "snake") drawSnake();
    if (name === "memory") newMemoryGame();
  }

  document.querySelectorAll(".game-card").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.game));
  });

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      stopSnake();
      stopMemorySnap();
      showScreen("home");
    });
  });

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => $(btn.dataset.close).classList.add("hidden"));
  });

  /* ADMIN */
  $("adminOpenBtn").addEventListener("click", () => {
    $("adminPin").value = "";
    $("pinError").textContent = "";
    $("adminLogin").classList.remove("hidden");
    $("adminPin").focus();
  });

  $("adminLoginBtn").addEventListener("click", login);
  $("adminPin").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });

  function login() {
    if ($("adminPin").value === PIN) {
      $("adminLogin").classList.add("hidden");
      $("adminPanel").classList.remove("hidden");
      updateAdmin();
    } else {
      $("pinError").textContent = "WRONG PIN.";
      $("adminPin").value = "";
      $("adminPin").focus();
    }
  }

  /* GLOBAL MESSAGE */
  $("sendMessageBtn").addEventListener("click", () => {
    const text = $("globalMessageInput").value.trim();
    if (!text) return;
    showMessage(text);
    $("globalMessageInput").value = "";
  });

  $("clearMessageBtn").addEventListener("click", () => {
    $("globalMessage").classList.add("hidden");
  });

  function showMessage(text) {
    $("globalMessage").textContent = "📢 " + text;
    $("globalMessage").classList.remove("hidden");
  }

  /* EVENTS */
  $("snakeCorruptionBtn").addEventListener("click", () => {
    state.snakeCorruption = !state.snakeCorruption;
    updateAdmin();
    updateBanners();
  });

  $("memorySnapBtn").addEventListener("click", () => {
    state.memorySnap = !state.memorySnap;
    updateAdmin();
    updateBanners();
    if (state.memorySnap) startMemorySnap();
    else stopMemorySnap();
  });

  function updateAdmin() {
    $("snakeCorruptionBtn").textContent = state.snakeCorruption ? "ON" : "OFF";
    $("memorySnapBtn").textContent = state.memorySnap ? "ON" : "OFF";
    $("snakeCorruptionBtn").classList.toggle("active", state.snakeCorruption);
    $("memorySnapBtn").classList.toggle("active", state.memorySnap);

    $("snakeEventStatus").textContent = state.snakeCorruption ? "ACTIVE" : "OFF";
    $("memoryEventStatus").textContent = state.memorySnap ? "ACTIVE" : "OFF";
    $("snakeEventStatus").classList.toggle("active", state.snakeCorruption);
    $("memoryEventStatus").classList.toggle("active", state.memorySnap);
  }

  function updateBanners() {
    $("snakeEventBanner").classList.toggle("hidden", !state.snakeCorruption);
    $("memoryEventBanner").classList.toggle("hidden", !state.memorySnap);
  }

  /* SNAKE */
  const canvas = $("snakeCanvas");
  const ctx = canvas.getContext("2d");
  const GRID = 20, TILE = 20;
  let snake = [], food = {x:5,y:5}, dir = {x:1,y:0}, next = {x:1,y:0};
  let snakeTimer = null, snakeRunning = false, snakeScore = 0;

  function startSnake() {
    stopSnake();
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = {x:1,y:0}; next = {x:1,y:0}; snakeScore = 0;
    $("snakeScore").textContent = "0";
    $("snakeStatus").textContent = "RUNNING...";
    createFood();
    snakeRunning = true;
    snakeTimer = setInterval(updateSnake, 120);
    drawSnake();
  }

  function stopSnake() {
    clearInterval(snakeTimer);
    snakeTimer = null;
    snakeRunning = false;
  }

  function createFood() {
    do {
      food = {x:Math.floor(Math.random()*GRID), y:Math.floor(Math.random()*GRID)};
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function updateSnake() {
    dir = next;
    let head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};

    if (state.snakeCorruption) {
      $("snakeCanvas").classList.add("glitch");
      if (Math.random() < .16) {
        const ds = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
        const d = ds[Math.floor(Math.random()*ds.length)];
        if (!(d.x === -dir.x && d.y === -dir.y)) dir = d;
      }
      if (Math.random() < .12) head.x += Math.random()<.5 ? -1 : 1;
      if (Math.random() < .12) head.y += Math.random()<.5 ? -1 : 1;
      head.x = (head.x + GRID) % GRID;
      head.y = (head.y + GRID) % GRID;
    } else {
      $("snakeCanvas").classList.remove("glitch");
      if (head.x<0 || head.x>=GRID || head.y<0 || head.y>=GRID) return endSnake();
    }

    if (snake.some(s => s.x===head.x && s.y===head.y)) return endSnake();

    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      snakeScore++;
      $("snakeScore").textContent = snakeScore;
      createFood();
    } else snake.pop();

    drawSnake();
  }

  function endSnake() {
    stopSnake();
    $("snakeStatus").textContent = "GAME OVER — PRESS START";
    drawSnake();
  }

  function drawSnake() {
    ctx.fillStyle = "#050508";
    ctx.fillRect(0,0,400,400);

    ctx.strokeStyle = "#11111b";
    for (let i=0;i<=GRID;i++) {
      ctx.beginPath(); ctx.moveTo(i*TILE,0); ctx.lineTo(i*TILE,400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i*TILE); ctx.lineTo(400,i*TILE); ctx.stroke();
    }

    ctx.fillStyle = "#ff4fd8";
    ctx.fillRect(food.x*TILE+3,food.y*TILE+3,TILE-6,TILE-6);

    snake.forEach((s,i) => {
      ctx.fillStyle = i===0 ? "#5cff75" : "#35bd52";
      ctx.fillRect(s.x*TILE+2,s.y*TILE+2,TILE-4,TILE-4);
    });
  }

  function changeDir(name) {
    const ds = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const d = ds[name];
    if (!d || (d.x===-dir.x && d.y===-dir.y)) return;
    next = d;
  }

  $("snakeStart").addEventListener("click", startSnake);
  document.querySelectorAll("[data-dir]").forEach(btn => {
    btn.addEventListener("click", () => changeDir(btn.dataset.dir));
  });

  document.addEventListener("keydown", e => {
    // Let text/password inputs use WASD normally.
    const active = document.activeElement;
    const typing =
      active &&
      (active.tagName === "INPUT" ||
       active.tagName === "TEXTAREA" ||
       active.isContentEditable);

    if (typing) return;

    const keys = {
      ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",
      ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"
    };

    if (keys[e.key]) {
      e.preventDefault();
      changeDir(keys[e.key]);
    }
  });

  /* REACTION */
  let reactionState = "idle", reactionTimer = null, reactionStart = 0, best = null;

  $("reactionBox").addEventListener("click", () => {
    if (reactionState === "idle") {
      reactionState = "waiting";
      $("reactionBox").className = "reaction-box ready";
      $("reactionText").innerHTML = "<strong>WAIT...</strong><br><br>DON'T CLICK!";
      reactionTimer = setTimeout(() => {
        reactionState = "go";
        reactionStart = performance.now();
        $("reactionBox").className = "reaction-box go";
        $("reactionText").innerHTML = "<strong>CLICK!</strong>";
      }, 1200 + Math.random()*2500);
    } else if (reactionState === "waiting") {
      clearTimeout(reactionTimer);
      reactionState = "idle";
      $("reactionBox").className = "reaction-box too-soon";
      $("reactionText").innerHTML = "<strong>TOO SOON!</strong><br><br>CLICK TO TRY AGAIN";
    } else if (reactionState === "go") {
      const time = Math.round(performance.now()-reactionStart);
      reactionState = "idle";
      $("reactionBox").className = "reaction-box";
      $("reactionLast").textContent = time;
      if (best === null || time < best) {
        best = time;
        $("reactionBest").textContent = time + "ms";
      }
      $("reactionText").innerHTML = `<strong>${time} MS</strong><br><br>CLICK TO GO AGAIN`;
    }
  });

  /* MEMORY */
  const symbols = ["👾","🚀","💎","⭐","🍒","⚡","🎮","👑"];
  let cards=[], first=null, second=null, locked=false, moves=0, snapTimer=null;

  function newMemoryGame() {
    stopMemorySnap();
    cards = [...symbols,...symbols].sort(()=>Math.random()-.5).map((symbol,id)=>({id,symbol,flipped:false,matched:false}));
    first=null; second=null; locked=false; moves=0;
    $("memoryMoves").textContent="0";
    $("memoryStatus").textContent="MATCH ALL PAIRS";
    renderMemory();
    if (state.memorySnap) startMemorySnap();
  }

  function renderMemory() {
    const board=$("memoryBoard");
    board.innerHTML="";
    cards.forEach(card => {
      const btn=document.createElement("button");
      btn.className="memory-card";
      if(card.flipped) btn.classList.add("flipped");
      if(card.matched) btn.classList.add("matched");
      btn.innerHTML=`<span class="card-front"></span><span class="card-back">${card.symbol}</span>`;
      btn.addEventListener("click",()=>flipCard(card.id));
      board.appendChild(btn);
    });
  }

  function flipCard(id) {
    if(locked) return;
    const card=cards.find(c=>c.id===id);
    if(!card || card.flipped || card.matched) return;

    card.flipped=true;
    if(!first) {
      first=card;
      renderMemory();
      return;
    }

    second=card;
    moves++;
    $("memoryMoves").textContent=moves;
    renderMemory();
    locked=true;

    setTimeout(()=>{
      if(first.symbol===second.symbol) {
        first.matched=true; second.matched=true;
      } else {
        first.flipped=false; second.flipped=false;
      }

      first=null; second=null; locked=false;
      renderMemory();

      if(cards.every(c=>c.matched))
        $("memoryStatus").textContent=`YOU WIN! ${moves} MOVES`;
    },700);
  }

  function startMemorySnap() {
    stopMemorySnap();
    snapTimer=setInterval(()=>{
      if(!state.memorySnap || locked) return;
      const open=cards.filter(c=>!c.matched && !c.flipped);
      const symbolsCopy=open.map(c=>c.symbol).sort(()=>Math.random()-.5);
      open.forEach((c,i)=>c.symbol=symbolsCopy[i]);
      renderMemory();
      $("memoryStatus").textContent="⚠ SNAP! CARDS SWITCHED!";
      setTimeout(()=>{
        if(!cards.every(c=>c.matched)) $("memoryStatus").textContent="MATCH ALL PAIRS";
      },900);
    },5000);
  }

  function stopMemorySnap() {
    clearInterval(snapTimer);
    snapTimer=null;
  }

  $("memoryStart").addEventListener("click", newMemoryGame);

  updateAdmin();
  updateBanners();
  newMemoryGame();
  drawSnake();
});


/* WILLIAMGAMES GLOBAL FIREBASE */
(function () {
  const config = {
    apiKey: "AIzaSyASJvp9Fp5vs7SoOcr7Njwk0BRpBrl_EeI",
    authDomain: "williamgames-194d6.firebaseapp.com",
    databaseURL: "https://williamgames-194d6-default-rtdb.firebaseio.com",
    projectId: "williamgames-194d6",
    storageBucket: "williamgames-194d6.firebasestorage.app",
    messagingSenderId: "890316629970",
    appId: "1:890316629970:web:f955654cd34c05b8c20a0b",
    measurementId: "G-7TPRGJM8BL"
  };

  try {
    if (!window.firebase) return;
    firebase.initializeApp(config);
    const db = firebase.database();
    const root = db.ref("williamGames/global");

    window.WILLIAMGAMES_GLOBAL = { snakeCorruption:false, memorySnap:false };

    root.child("message").on("value", s => {
      const d = s.val(), box = document.getElementById("globalMessage");
      if (!box) return;
      if (d && d.active && d.text) {
        box.textContent = "📢 " + d.text;
        box.classList.remove("hidden");
      } else box.classList.add("hidden");
    });

    root.child("events").on("value", s => {
      const e = s.val() || {};
      window.WILLIAMGAMES_GLOBAL = {
        snakeCorruption: !!e.snakeCorruption,
        memorySnap: !!e.memorySnap
      };
      document.documentElement.classList.toggle("wg-snake-corruption", !!e.snakeCorruption);
      document.documentElement.classList.toggle("wg-memory-snap", !!e.memorySnap);

      const sb = document.getElementById("snakeEventBanner");
      const mb = document.getElementById("memoryEventBanner");
      if (sb) sb.classList.toggle("hidden", !e.snakeCorruption);
      if (mb) mb.classList.toggle("hidden", !e.memorySnap);

      if (typeof window.WG_APPLY_GLOBAL_EVENTS === "function")
        window.WG_APPLY_GLOBAL_EVENTS(window.WILLIAMGAMES_GLOBAL);
    });

    const send = document.getElementById("sendMessageBtn");
    const clear = document.getElementById("clearMessageBtn");
    const input = document.getElementById("globalMessageInput");

    if (send) send.addEventListener("click", () => {
      const text = input && input.value.trim();
      if (!text) return;
      root.child("message").set({
        text, active:true,
        updatedAt:firebase.database.ServerValue.TIMESTAMP
      });
      input.value = "";
    });

    if (clear) clear.addEventListener("click", () => {
      root.child("message").set({
        text:"", active:false,
        updatedAt:firebase.database.ServerValue.TIMESTAMP
      });
    });

    const snake = document.getElementById("snakeCorruptionBtn");
    const memory = document.getElementById("memorySnapBtn");

    if (snake) snake.addEventListener("click", () => {
      root.child("events/snakeCorruption").set(
        !window.WILLIAMGAMES_GLOBAL.snakeCorruption
      );
    });

    if (memory) memory.addEventListener("click", () => {
      root.child("events/memorySnap").set(
        !window.WILLIAMGAMES_GLOBAL.memorySnap
      );
    });

    let snapTimer = null;
    function applyEvents(e) {
      if (e.memorySnap && !snapTimer) {
        snapTimer = setInterval(() => {
          const board = document.getElementById("memoryBoard");
          if (!board || !window.WILLIAMGAMES_GLOBAL.memorySnap) return;
          const cards = [...board.querySelectorAll(".memory-card:not(.matched):not(.flipped)")];
          cards.sort(() => Math.random() - 0.5).forEach(c => board.appendChild(c));
          const status = document.getElementById("memoryStatus");
          if (status) status.textContent = "⚠ GLOBAL SNAP! CARDS SWITCHED!";
        }, 5000);
      } else if (!e.memorySnap && snapTimer) {
        clearInterval(snapTimer);
        snapTimer = null;
      }
      const canvas = document.getElementById("snakeCanvas");
      if (canvas) canvas.classList.toggle("glitch", !!e.snakeCorruption);
    }
    window.WG_APPLY_GLOBAL_EVENTS = applyEvents;
    applyEvents(window.WILLIAMGAMES_GLOBAL);
  } catch (err) {
    console.error("WilliamGames Firebase error:", err);
  }
})();
