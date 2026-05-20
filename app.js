// Dialogue data will be loaded dynamically from the YAML file
let dialogueNodes = {};
let currentDialoguePath = []; // Track active path: ['dialogues', 'nexus_lounge', 'nodes']

// Load dialogue data from YAML file
async function loadDialogueData() {
  try {
    const response = await fetch('Assets/Conversation data/conversations.yaml');
    if (!response.ok) throw new Error('Failed to fetch conversation data');
    const yamlText = await response.text();
    // js-yaml is loaded via CDN in index.html
    const parsedData = jsyaml.load(yamlText);

    // Safely pull the nodes list out of the yaml nesting
    if (parsedData && parsedData.dialogues && parsedData.dialogues.nexus_lounge) {
      dialogueNodes = parsedData.dialogues.nexus_lounge.nodes;
      console.log('Dialogue data loaded, nodes count:', Object.keys(dialogueNodes).length);
    } else {
      throw new Error('YAML structured unexpectedly.');
    }
  } catch (e) {
    console.error('Error loading dialogue data:', e);
    alert('Unable to load story data. See console for details.');
  }
}

// State Variables
let currentNodeId = "node_0";
let currentTextIndex = 0;
let isTyping = false;
let typeInterval = null;
let textSpeed = 40; // ms per letter
let soundEnabled = true;
let dialogueHistory = [];

// Image Paths mapped from Assets/Images
const imagePaths = {
  background: "Assets/Images/background/village.jpg",
  maya: "Assets/Images/characters/megane.png",
  yuki: "Assets/Images/characters/police.png"
};

// Web Audio API Retro Sound Effects
let audioCtx = null;

function playBeep(frequency = 600, type = "sine", duration = 0.04) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Add volume envelope to avoid clicks
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

// Start Game
async function startGame() {
  // Load dialogue data first
  await loadDialogueData();
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("game-bg").classList.add("pan-active");

  currentNodeId = "node_0";
  dialogueHistory = [];

  // Set sprites sources
  document.getElementById("img-left").src = imagePaths.maya;
  document.getElementById("img-right").src = imagePaths.yuki;

  renderNode(currentNodeId);
}

// Render Dialogue Node
function renderNode(nodeId) {
  currentNodeId = nodeId;
  const node = dialogueNodes[nodeId];
  if (!node) return;

  // Capitalize or match the speaker string formatting from your YAML configuration
  const rawSpeaker = node.speaker || "narrator";
  const displaySpeaker = rawSpeaker.charAt(0).toUpperCase() + rawSpeaker.slice(1);

  // Handle speaker tag and highlight colors
  const speakerEl = document.getElementById("speaker-name");
  speakerEl.textContent = displaySpeaker;
  speakerEl.className = `speaker-tag ${rawSpeaker}-tag`;

  // Log dialogue history
  if (displaySpeaker !== "Narrator" || node.text.indexOf("Thank you for playing") === -1) {
    if (dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length - 1].text !== node.text) {
      dialogueHistory.push({
        speaker: displaySpeaker,
        speakerClass: rawSpeaker === "maya" ? "maya" : (rawSpeaker === "yuki" ? "yuki" : "narrator"),
        text: node.text
      });
    }
  }

  // Handle Character Display States dynamically mapped from who is currently speaking
  const leftChar = document.getElementById("char-left");
  const rightChar = document.getElementById("char-right");

  if (rawSpeaker === "narrator") {
    updateCharacterState(leftChar, "dimmed");
    updateCharacterState(rightChar, "dimmed");
  } else if (rawSpeaker === "maya") {
    updateCharacterState(leftChar, "talking");
    updateCharacterState(rightChar, "dimmed");
  } else if (rawSpeaker === "yuki") {
    updateCharacterState(leftChar, "dimmed");
    updateCharacterState(rightChar, "talking");
  }

  // Typewriter Text presentation
  const textEl = document.getElementById("dialogue-text");
  const continueIcon = document.getElementById("continue-icon");
  const choiceContainer = document.getElementById("choice-container");

  continueIcon.classList.add("hidden");
  choiceContainer.classList.add("hidden");
  choiceContainer.innerHTML = "";

  if (typeInterval) clearInterval(typeInterval);
  isTyping = true;
  currentTextIndex = 0;
  textEl.innerHTML = "";

  const textToType = node.text;

  typeInterval = setInterval(() => {
    if (currentTextIndex < textToType.length) {
      textEl.innerHTML += textToType.charAt(currentTextIndex);

      // Beep sound effect for letters (except space)
      if (textToType.charAt(currentTextIndex) !== " " && currentTextIndex % 2 === 0) {
        const freq = rawSpeaker === "maya" ? 500 : (rawSpeaker === "yuki" ? 700 : 350);
        playBeep(freq, "sine", 0.03);
      }

      currentTextIndex++;
    } else {
      finishTyping();
    }
  }, textSpeed);
}

function finishTyping() {
  clearInterval(typeInterval);
  isTyping = false;
  const node = dialogueNodes[currentNodeId];
  document.getElementById("dialogue-text").textContent = node.text;

  // Display continue indicator or choice menu
  if (node.choices && node.choices.length > 0) {
    displayChoices(node.choices);
  } else {
    document.getElementById("continue-icon").classList.remove("hidden");
  }
}

// Character state css application
function updateCharacterState(element, state) {
  element.className = "character-container"; // reset classes
  if (state === "hidden") {
    element.classList.add("hidden");
  } else if (state === "dimmed") {
    element.classList.add("dimmed");
  } else if (state === "talking") {
    element.classList.add("talking");
  }
}

// Display Branching Options
function displayChoices(choices) {
  const container = document.getElementById("choice-container");
  container.innerHTML = "";
  container.classList.remove("hidden");

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.onclick = (e) => {
      e.stopPropagation(); // Avoid triggering page click advancement
      playBeep(450, "triangle", 0.08);
      renderNode(choice.next);
    };
    container.appendChild(btn);
  });
}

// Handle dialogue advancement clicks
document.getElementById("dialogue-panel").onclick = () => {
  advanceDialogue();
};

function advanceDialogue() {
  if (isTyping) {
    finishTyping();
  } else {
    const node = dialogueNodes[currentNodeId];
    if (node.choices && node.choices.length > 0) {
      // Do nothing, force user to pick a choice
      return;
    }
    if (node.next) {
      renderNode(node.next);
    } else {
      // Game ended
      quitToMenu();
    }
  }
}

// Keyboard shortcuts for advance
window.onkeydown = (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    // Only advance if dialogue screen is active and modal isn't open
    const gameScreen = document.getElementById("game-screen");
    const modals = document.querySelectorAll(".modal-overlay");
    let modalOpen = false;
    modals.forEach(m => {
      if (!m.classList.contains("hidden")) modalOpen = true;
    });

    if (!gameScreen.classList.contains("hidden") && !modalOpen) {
      e.preventDefault();
      advanceDialogue();
    }
  }
};

// Quit/Menu Navigation
function quitToMenu() {
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
  document.getElementById("game-bg").classList.remove("pan-active");
  if (typeInterval) clearInterval(typeInterval);
}

// Modals Trigger
function toggleLogModal(show) {
  const modal = document.getElementById("log-modal");
  if (show) {
    modal.classList.remove("hidden");
    const body = document.getElementById("log-body");
    body.innerHTML = "";

    dialogueHistory.forEach(entry => {
      const el = document.createElement("div");
      el.className = "log-entry";

      const speaker = document.createElement("div");
      speaker.className = `log-speaker ${entry.speakerClass}`;
      speaker.textContent = entry.speaker;

      const text = document.createElement("div");
      text.className = "log-text";
      text.textContent = entry.text;

      el.appendChild(speaker);
      el.appendChild(text);
      body.appendChild(el);
    });
    body.scrollTop = body.scrollHeight; // Scroll to bottom
  } else {
    modal.classList.add("hidden");
  }
}

function toggleSettingsModal(show) {
  document.getElementById("settings-modal").className = show ? "modal-overlay" : "modal-overlay hidden";
}

function toggleAboutModal(show) {
  document.getElementById("about-modal").className = show ? "modal-overlay" : "modal-overlay hidden";
}

// Settings configuration
function updateTextSpeed(val) {
  // val is range from 10 to 100
  // Invert it so higher slider value = faster speed (smaller delay)
  textSpeed = 110 - val;
  const label = document.getElementById("speed-val");
  if (val < 35) label.textContent = "Slow";
  else if (val < 75) label.textContent = "Normal";
  else label.textContent = "Fast";
}

function toggleSound(checked) {
  soundEnabled = checked;
}

// Quick Save / Load System
function saveGame() {
  const gameState = {
    currentNodeId: currentNodeId,
    dialogueHistory: dialogueHistory
  };
  localStorage.setItem("cyber_nexus_save", JSON.stringify(gameState));
  playBeep(900, "triangle", 0.12);
  alert("Game saved successfully!");
}

function loadGame() {
  const save = localStorage.getItem("cyber_nexus_save");
  if (save) {
    const gameState = JSON.parse(save);
    dialogueHistory = gameState.dialogueHistory;

    // Switch into gameplay mode in case we are on start menu
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("game-bg").classList.add("pan-active");

    // Set sprites sources
    document.getElementById("img-left").src = imagePaths.maya;
    document.getElementById("img-right").src = imagePaths.yuki;

    // Load dynamic node mapping
    loadDialogueData().then(() => {
      renderNode(gameState.currentNodeId);
      playBeep(800, "triangle", 0.1);
    });
  } else {
    alert("No save data found!");
  }
}