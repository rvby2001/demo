// Dialogue data will be loaded dynamically from the YAML file
let dialogueNodes = {};
let currentDialogueId = "1";
let allDialogues = {};
let allCharacters = {};
let allBackgrounds = {};
let allConversations = {};

// Load global configuration (characters & backgrounds)
async function loadGlobalConfig() {
  try {
    const response = await fetch('Assets/ConversationData/conversations.yaml');
    if (!response.ok) throw new Error('Failed to fetch global configuration');
    const yamlText = await response.text();
    const parsedData = jsyaml.load(yamlText);

    if (parsedData) {
      allCharacters = parsedData.characters || {};
      allBackgrounds = parsedData.backgrounds || {};
      allConversations = parsedData.conversations || {};
      console.log('Global configuration loaded successfully.');
    } else {
      throw new Error('Global configuration structure is invalid.');
    }
  } catch (e) {
    console.error('Error loading global configuration:', e);
    alert('Unable to load configuration data. See console for details.');
  }
}

// Dynamically fetch and parse a specific conversation file
async function loadDialogueFile(dialogueId) {
  try {
    const resolvedPath = allConversations[dialogueId] || dialogueId;
    const response = await fetch(`Assets/ConversationData/${resolvedPath}.yaml`);
    if (!response.ok) throw new Error(`Failed to fetch dialogue file for '${dialogueId}' (resolved to '${resolvedPath}')`);
    const yamlText = await response.text();
    const parsedDialogue = jsyaml.load(yamlText);

    if (parsedDialogue) {
      allDialogues[dialogueId] = parsedDialogue;
      dialogueNodes = parsedDialogue.nodes || {};
      console.log(`Loaded dialogue file '${resolvedPath}.yaml', nodes count:`, Object.keys(dialogueNodes).length);
    } else {
      throw new Error(`Dialogue file for '${dialogueId}' is invalid.`);
    }
  } catch (e) {
    console.error(`Error loading dialogue '${dialogueId}':`, e);
    alert(`Unable to load story file for '${dialogueId}'. See console for details.`);
  }
}

// State Variables
let activeLeftCharId = "";
let activeRightCharId = "";

function updateSceneCharacters(leftId, rightId) {
  activeLeftCharId = leftId;
  activeRightCharId = rightId;

  const leftImg = document.getElementById("img-left");
  const rightImg = document.getElementById("img-right");
  const leftChar = document.getElementById("char-left");
  const rightChar = document.getElementById("char-right");

  // Handle Left Character image and visibility
  if (leftId && allCharacters[leftId] && allCharacters[leftId].image) {
    leftImg.src = allCharacters[leftId].image;
    leftChar.classList.remove("hidden");
  } else {
    leftChar.classList.add("hidden");
  }

  // Handle Right Character image and visibility
  if (rightId && allCharacters[rightId] && allCharacters[rightId].image) {
    rightImg.src = allCharacters[rightId].image;
    rightChar.classList.remove("hidden");
  } else {
    rightChar.classList.add("hidden");
  }
}

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
  currentDialogueId = "1";
  // Load dynamic config and first dialogue
  await loadGlobalConfig();
  await loadDialogueFile(currentDialogueId);
  
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("game-bg").classList.add("pan-active");

  const startNode = allDialogues[currentDialogueId].start_node || "node_0";
  currentNodeId = startNode;
  dialogueHistory = [];

  // Update background dynamically if specified
  const bgKey = allDialogues[currentDialogueId].background;
  if (bgKey && allBackgrounds[bgKey]) {
    document.getElementById("game-bg").style.backgroundImage = `url('${allBackgrounds[bgKey]}')`;
  }

  // Set sprites sources dynamically
  const leftCharId = allDialogues[currentDialogueId].left_character;
  const rightCharId = allDialogues[currentDialogueId].right_character;
  updateSceneCharacters(leftCharId, rightCharId);

  renderNode(currentNodeId);
}

// Render Dialogue Node
function renderNode(nodeId) {
  currentNodeId = nodeId;
  const node = dialogueNodes[nodeId];
  if (!node) return;

  // Capitalize or match the speaker string formatting from your YAML configuration
  const rawSpeaker = node.speaker || "narrator";
  const charData = allCharacters[rawSpeaker];
  const displaySpeaker = charData ? charData.name : (rawSpeaker.charAt(0).toUpperCase() + rawSpeaker.slice(1));

  // Handle speaker tag and highlight colors
  const speakerEl = document.getElementById("speaker-name");
  speakerEl.textContent = displaySpeaker;
  speakerEl.className = `speaker-tag ${rawSpeaker}-tag`;

  // Log dialogue history
  if (displaySpeaker !== "Narrator" || node.text.indexOf("Thank you for playing") === -1) {
    if (dialogueHistory.length === 0 || dialogueHistory[dialogueHistory.length - 1].text !== node.text) {
      dialogueHistory.push({
        speaker: displaySpeaker,
        speakerClass: rawSpeaker === "maya" || rawSpeaker === "princess" ? "maya" : (rawSpeaker === "yuki" || rawSpeaker === "schoolgirl" || rawSpeaker === "swimsuit" ? "yuki" : "narrator"),
        text: node.text
      });
    }
  }

  // Handle Character Display States dynamically mapped from who is currently speaking
  const leftChar = document.getElementById("char-left");
  const rightChar = document.getElementById("char-right");

  if (rawSpeaker === activeLeftCharId) {
    updateCharacterState(leftChar, "talking");
    updateCharacterState(rightChar, "dimmed");
  } else if (rawSpeaker === activeRightCharId) {
    updateCharacterState(leftChar, "dimmed");
    updateCharacterState(rightChar, "talking");
  } else {
    updateCharacterState(leftChar, "dimmed");
    updateCharacterState(rightChar, "dimmed");
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
      if (choice.next_dialogue) {
        transitionToDialogue(choice.next_dialogue);
      } else if (choice.next) {
        renderNode(choice.next);
      } else {
        quitToMenu();
      }
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
    if (node.next_dialogue) {
      transitionToDialogue(node.next_dialogue);
    } else if (node.next) {
      renderNode(node.next);
    } else {
      // Game ended
      quitToMenu();
    }
  }
}

// Transition smoothly to a new dialogue/scene
async function transitionToDialogue(dialogueId) {
  // Dynamically load the scene's dialogue file if not cached
  if (!allDialogues[dialogueId]) {
    await loadDialogueFile(dialogueId);
  }
  
  const activeDialogue = allDialogues[dialogueId];
  if (!activeDialogue) {
    console.error(`Dialogue '${dialogueId}' failed to load.`);
    quitToMenu();
    return;
  }
  currentDialogueId = dialogueId;
  dialogueNodes = activeDialogue.nodes || {};

  console.log(`Transitioning to dialogue: ${dialogueId}`);

  // Update background dynamically if specified
  const bgKey = activeDialogue.background;
  if (bgKey && allBackgrounds[bgKey]) {
    const bgUrl = allBackgrounds[bgKey];
    document.getElementById("game-bg").style.backgroundImage = `url('${bgUrl}')`;
  }

  // Update scene characters dynamically if specified
  const leftCharId = activeDialogue.left_character;
  const rightCharId = activeDialogue.right_character;
  updateSceneCharacters(leftCharId, rightCharId);

  // Render the starting node of the new dialogue
  const startNode = activeDialogue.start_node || "node_0";
  renderNode(startNode);
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
    currentDialogueId: currentDialogueId,
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
    currentDialogueId = gameState.currentDialogueId || "1";

    // Switch into gameplay mode in case we are on start menu
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("game-bg").classList.add("pan-active");

    // Load global registry and active dialogue file dynamically
    loadGlobalConfig().then(() => {
      loadDialogueFile(currentDialogueId).then(() => {
        const activeDialogue = allDialogues[currentDialogueId];
        if (activeDialogue) {
          // Ensure background is updated correctly on load
          const bgKey = activeDialogue.background;
          if (bgKey && allBackgrounds[bgKey]) {
            document.getElementById("game-bg").style.backgroundImage = `url('${allBackgrounds[bgKey]}')`;
          }

          // Update scene characters dynamically if specified
          const leftCharId = activeDialogue.left_character;
          const rightCharId = activeDialogue.right_character;
          updateSceneCharacters(leftCharId, rightCharId);

          renderNode(gameState.currentNodeId);
          playBeep(800, "triangle", 0.1);
        } else {
          alert("Failed to load dialogue data for saved game.");
        }
      });
    });
  } else {
    alert("No save data found!");
  }
}