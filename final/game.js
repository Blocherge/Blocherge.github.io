const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const swordGoblinImg = new Image();
swordGoblinImg.src = "assets/sword goblin.png";

const rangeGoblinImg = new Image();
rangeGoblinImg.src = "assets/range goblin.png";

const knightImg = new Image();
knightImg.src = "assets/knight.png";

const playerSwordRange = 50;
const swordGoblinRange = 40;
const crossbowRange = 140;
const maxVolume = 100;

let audioContext = null;
let musicGain = null;
let musicOsc = null;
let musicTimer = null;
let musicStarted = false;

let difficulty = null;
let baseGoblinCount = 0;
let killCount = 0;

let player = {
  x: 250,
  y: 250,
  hp: 100,
  maxHp: 100,
  potions: 3,
  facingX: 1,
  facingY: 0,
  attackType: null,
  attackTimer: 0,
  attackTarget: null
};

let goblins = [];
let volume = 0;

function selectDifficulty(level) {
  difficulty = level;

  if (level === "easy") baseGoblinCount = 2;
  if (level === "medium") baseGoblinCount = 4;
  if (level === "hard") baseGoblinCount = 6;

  spawnGoblins(baseGoblinCount);
  document.getElementById("difficultyButtons").style.display = "none";
  startMusic();
}

function spawnGoblins(count) {
  for (let i = 0; i < count; i++) {
    const type = Math.random() < 0.5 ? "sword" : "archer";
    const maxHp = type === "sword" ? 25 : 15;

    goblins.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      hp: maxHp,
      maxHp: maxHp,
      type: type,
      arrowTimer: 0,
      arrowTarget: null
    });
  }
}

function startMusic() {
  if (musicStarted) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0;
  musicGain.connect(audioContext.destination);

  const notes = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392];
  musicOsc = audioContext.createOscillator();
  musicOsc.type = "triangle";
  musicOsc.frequency.value = notes[0];
  musicOsc.connect(musicGain);
  musicOsc.start();

  let step = 0;
  musicTimer = setInterval(() => {
    if (!audioContext || audioContext.state === "suspended") return;
    musicOsc.frequency.setTargetAtTime(notes[step % notes.length], audioContext.currentTime, 0.05);
    step += 1;
    updateMusicVolume();
  }, 400);

  musicStarted = true;
}

function updateMusicVolume() {
  if (!musicGain || !audioContext) return;
  const volumeFraction = Math.min(maxVolume, Math.max(0, volume)) / maxVolume;
  musicGain.gain.setTargetAtTime(volumeFraction, audioContext.currentTime, 0.05);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player sword range
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x, player.y, playerSwordRange, 0, Math.PI * 2);
  ctx.stroke();

  // Player sprite
  const playerSize = 40;
  const playerDrawX = player.x - playerSize / 2;
  const playerDrawY = player.y - playerSize / 2;
  if (knightImg.complete && knightImg.naturalWidth > 0) {
    ctx.drawImage(knightImg, playerDrawX, playerDrawY, playerSize, playerSize);
  } else {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack animation overlay
  if (player.attackTimer > 0) {
    const progress = player.attackTimer / 18;

    if (player.attackType === "sword") {
      const swingRadius = 30 + 8 * (1 - progress);
      const swingAngle = Math.PI / 3;
      const baseAngle = Math.atan2(player.facingY, player.facingX);

      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 200, 60, ${0.6 * progress})`;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, swingRadius, baseAngle - swingAngle / 2, baseAngle + swingAngle / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (player.attackType === "crossbow") {
      const arrowLength = 140;
      let tipX = player.x + player.facingX * arrowLength;
      let tipY = player.y + player.facingY * arrowLength;

      if (player.attackTarget) {
        tipX = player.attackTarget.x;
        tipY = player.attackTarget.y;
      }

      ctx.strokeStyle = `rgba(200, 240, 255, ${0.8 * progress})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * progress})`;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 6 * progress, 0, Math.PI * 2);
      ctx.fill();
    }

    player.attackTimer -= 1;
    if (player.attackTimer <= 0) {
      player.attackTimer = 0;
      player.attackType = null;
    }

    volume = Math.min(volume, maxVolume);
  }

  // Goblin sprites and health bars
  goblins.forEach(g => {
    const width = 40;
    const height = 40;
    const drawX = g.x - width / 2;
    const drawY = g.y - height / 2;

    if (g.type === "sword") {
      ctx.strokeStyle = "rgba(255,0,0,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, swordGoblinRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    const img = g.type === "archer" ? rangeGoblinImg : swordGoblinImg;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, drawX, drawY, width, height);
    } else {
      ctx.fillStyle = g.type === "archer" ? "orange" : "green";
      ctx.beginPath();
      ctx.arc(g.x, g.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    if (g.arrowTimer > 0 && g.arrowTarget) {
      const progress = g.arrowTimer / 12;
      ctx.strokeStyle = `rgba(200, 240, 255, ${0.7 * progress})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.arrowTarget.x, g.arrowTarget.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255,255,255, ${0.7 * progress})`;
      const tipX = g.x + (g.arrowTarget.x - g.x) * (1 - progress);
      const tipY = g.y + (g.arrowTarget.y - g.y) * (1 - progress);
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      ctx.fill();

      g.arrowTimer -= 1;
      if (g.arrowTimer <= 0) {
        g.arrowTimer = 0;
        g.arrowTarget = null;
      }
    }

    const barWidth = 40;
    const barHeight = 6;
    const barX = g.x - barWidth / 2;
    const barY = g.y - height / 2 - 12;
    const healthPercent = Math.max(0, g.hp / g.maxHp);

    ctx.fillStyle = "black";
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "lime";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  });

  updateMusicVolume();
  updateStats();
}

function updateStats() {
  document.getElementById("stats").innerText =
    `HP: ${player.hp} | Potions: ${player.potions} | Volume: ${volume} | Goblins: ${goblins.length} | Kills: ${killCount}`;
}

function movePlayer(dir) {
  const step = 15;
  let deltaX = 0;
  let deltaY = 0;

  if (dir === "up") deltaY = -step;
  if (dir === "down") deltaY = step;
  if (dir === "left") deltaX = -step;
  if (dir === "right") deltaX = step;

  if (deltaX !== 0 || deltaY !== 0) {
    const mag = Math.hypot(deltaX, deltaY) || 1;
    player.facingX = deltaX / mag;
    player.facingY = deltaY / mag;
  }

  player.x += deltaX;
  player.y += deltaY;

  player.x = clamp(player.x, 10, canvas.width - 10);
  player.y = clamp(player.y, 10, canvas.height - 10);

  goblinTurn();
  checkDeath();
}

function attack(type) {
  if (player.attackTimer > 0) return;

  player.attackType = type;
  player.attackTimer = 18;
  player.attackTarget = null;

  if (type === "sword") {
    const range = playerSwordRange;
    const damage = 12;
    let closest = null;
    let closestDist = Infinity;

    goblins.forEach(g => {
      const dist = Math.hypot(player.x - g.x, player.y - g.y);
      if (dist <= range && dist < closestDist) {
        closest = g;
        closestDist = dist;
      }
    });

    if (closest) {
      player.attackTarget = { x: closest.x, y: closest.y };
      player.facingX = (closest.x - player.x) / Math.max(1, closestDist);
      player.facingY = (closest.y - player.y) / Math.max(1, closestDist);
    }

    const inRange = goblins
      .map(g => ({ g, dist: Math.hypot(player.x - g.x, player.y - g.y) }))
      .filter(entry => entry.dist <= range)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);

    inRange.forEach(entry => {
      const g = entry.g;
      g.hp -= damage;
      volume += 3;
      volume = Math.min(volume, maxVolume);

      if (g.hp <= 0) {
        const index = goblins.indexOf(g);
        if (index !== -1) {
          goblins.splice(index, 1);
          killCount++;

          if (difficulty !== "easy" && killCount % 2 === 0) {
            spawnGoblins(1 + Math.floor(killCount / 4));
          }
          ensureEasyGoblinCount();
        }
      }
    });
  }

  if (type === "crossbow") {
    const range = 140;
    const damage = 6;
    let closest = null;
    let closestDist = Infinity;

    goblins.forEach(g => {
      const dist = Math.hypot(player.x - g.x, player.y - g.y);
      if (dist <= range && dist < closestDist) {
        closest = g;
        closestDist = dist;
      }
    });

    if (closest) {
      closest.hp -= damage;
      volume += 1;
      volume = Math.min(volume, maxVolume);
      player.attackTarget = { x: closest.x, y: closest.y };
      player.facingX = (closest.x - player.x) / Math.max(1, closestDist);
      player.facingY = (closest.y - player.y) / Math.max(1, closestDist);

      if (closest.hp <= 0) {
        const index = goblins.indexOf(closest);
        if (index !== -1) {
          goblins.splice(index, 1);
          killCount++;

          if (difficulty !== "easy" && killCount % 2 === 0) {
            spawnGoblins(1 + Math.floor(killCount / 4));
          }
        }
      }
    }
  }

  ensureEasyGoblinCount();
  goblinTurn();
  checkDeath();
}

function usePotion() {
  if (player.potions > 0) {
    player.hp = Math.min(player.maxHp, player.hp + 30);
    player.potions--;
  }

  goblinTurn();
  draw();
}

function goblinTurn() {
  goblins.forEach(g => {
    const dist = Math.hypot(player.x - g.x, player.y - g.y);

    if (g.type === "sword") {
      if (dist < 40) {
        player.hp -= 5;
      } else {
        g.x += (player.x - g.x) * 0.1;
        g.y += (player.y - g.y) * 0.1;
      }
    }

    if (g.type === "archer") {
      if (dist > 120) {
        g.x += (player.x - g.x) * 0.06;
        g.y += (player.y - g.y) * 0.06;
      } else if (dist < 60) {
        g.x -= (player.x - g.x) * 0.08;
        g.y -= (player.y - g.y) * 0.08;
      } else {
        player.hp -= 3;
        g.arrowTimer = 12;
        g.arrowTarget = { x: player.x, y: player.y };
      }
    }

    // Keep goblins inside canvas
    g.x = clamp(g.x, 8, canvas.width - 8);
    g.y = clamp(g.y, 8, canvas.height - 8);
  });
}
function ensureEasyGoblinCount() {
  if (difficulty === "easy" && goblins.length < 2) {
    spawnGoblins(2 - goblins.length);
  }
}

function checkDeath() {
  if (player.hp <= 0) {
    alert("You died! Restarting...");
    resetGame();
  }
}

function setVolume() {
  volume = maxVolume;
  resetGame("Volume reached 100! Game over.");
}

function resetGame(message = "Restarting...") {
  if (message) alert(message);
  volume = 0;
  killCount = 0;
  goblins = [];
  player.hp = player.maxHp;
  if (difficulty) {
    spawnGoblins(baseGoblinCount);
    ensureEasyGoblinCount();
  }
}

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();