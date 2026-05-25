---
name: story-scene-composer
description: Guidelines, branching choice patterns, and YAML schema structures for composing interactive visual novel dialogue scenes in the Cyber Nexus engine with numerical mapping.
---
# Skill: Visual Novel Story Scene Composer

This skill defines the technical dialogue schemas, branching rules, and structural guidelines for composing interactive visual novel dialogue trees inside the game engine's YAML files. It translates the narrative outlines designed under the `story-scene-design` skill into production-ready assets located in the `ConversationData` folder structure and loaded via numerical keys.

### Target Output Location
All composed visual novel conversation trees must be saved to:
`Assets/ConversationData/Scene_[number]_[name]/Conversation_[number]_[name].yaml` (where `[number]` is the sequential index, and `[name]` is the snake_case name of the scene, e.g. `Assets/ConversationData/Scene_4_Garden/Conversation_4_garden.yaml`).

---

## 1. Technical Scene Composition Philosophy

Composing dialogue maps a narrative beat designed in a `story-scene-design` outline onto the visual stage of the engine:

### A. The Visual Stage (The Two-Character Canvas)
Visual novels display characters as sprites on a background. To keep production simple and elegant, our system anchors two main character sprites to the stage:
*   **`left_character` & `right_character`:** The static visual slots. They establish who is present in the scene.
*   **Speaker Focus:** The `speaker` field dictates who is talking. Visual engines will highlight or illuminate the speaker sprite while dimming the other.
*   **The Narrative Voice (`narrator`):** Used for world-building, sensory details, and transition descriptions. When `narrator` speaks, both character sprites are usually shown in a neutral/passive state.

### B. Choice Architecture & Branching Structures
Branching dialogue is powerful but can lead to "state explosion" if not managed intelligently. Use three distinct routing strategies:
1.  **Branch & Merge (Flavor Branching):**
    *   The player makes a choice, splitting the narrative into short, unique response nodes (usually 3–5 lines of dialogue).
    *   Both paths then merge back into a single common node (e.g., `node_merge`).
    *   *Best for:* Minor personality tests, banter, or character reaction branches that do not change the ultimate outcome of the scene.
2.  **Branch & Exit (Scene Transition by Number):**
    *   The player makes a choice that redirects the story to a completely different location or sub-quest.
    *   This transitions the entire game state to a new conversation file by setting the `next_dialogue` attribute to the target conversation **number** (e.g. `next_dialogue: 2`).
    *   *Best for:* Major plot decisions, travelling to new locations, or triggering specific companion routes.
3.  **Terminal Nodes:**
    *   A node that marks the end of a storyline or a playthrough, setting `next: null` with no choices left.

---

## 2. Technical YAML Schema Specification

Every scene YAML file must adhere to this exact structural format to be successfully parsed by the dialogue engine.

### Global Header Block
Every file must start with these four mandatory keys:
```yaml
start_node: "node_id"       # The string ID of the node where the scene begins.
background: "bg_key"        # The background ID (defined in conversations.yaml).
left_character: "char_id"   # The character ID positioned on the left side.
right_character: "char_id"  # The character ID positioned on the right side.
```

### The `nodes` Registry
A mapping of all dialogue nodes. Each node is identified by a unique alphanumeric key (e.g., `node_0`, `node_1a`, `node_choice_a`).

#### Node Structure
Each node under the `nodes` object can take two forms:

##### 1. Linear Dialogue Node
Used for sequential, non-branching dialogue.
```yaml
  node_id:
    speaker: "char_id"      # The character speaking ("narrator" or key in conversations.yaml).
    text: "Dialogue text."  # The line of dialogue or narrative text.
    next: "next_node_id"    # The ID of the node to load next, or null to terminate.
```

##### 2. Branching Choice Node
Used to halt dialogue and display a list of interactive choices to the player.
```yaml
  node_id:
    speaker: "char_id"      # The character prompting the choice.
    text: "Dialogue prompt." # The question or setup text.
    choices:
      - text: "Choice option button 1"
        next: "node_branch_1"  # Target node ID in the CURRENT file.
      - text: "Choice option button 2"
        next_dialogue: 2       # Loads conversation NUMBER 2 (as defined in conversations.yaml).
      - text: "Choice option button 3"
        next: null            # Terminates the game upon selection.
```

---

## 3. Character Integration & Global Registry

Before writing a character into dialogue trees, they must be registered in the global engine config file `Assets/ConversationData/conversations.yaml`.

### Character Registration Blueprint
*   **Name & Color Sourcing**: Sourced directly from their character design profile markdown at `project/character/<name>/<name>.md` (e.g. signature color hex).
*   **Image Sourcing (Optional)**: Sourced directly from their visual asset folder at `project/character/<name>/image/<name>_default.png`. If a character does not have an image asset or the `image` key is completely omitted in the global configuration, the game engine will automatically hide their sprite container and render no visual slot on stage.

#### Registry Example (conversations.yaml)
```yaml
characters:
  narrator:
    name: "Narrator"
    color: "#aaaaaa"
  dorian:
    name: "Dorian"
    color: "#8B0000"                           # Sourced from project/character/dorian/dorian.md
    image: "project/character/dorian/image/dorian default.png"  # Sourced from project/character/dorian/image/
  silas:
    name: "Silas"
    color: "#708090"                           # Sourced from project/character/silas/silas.md
    image: "project/character/silas/image/silas_default.png"    # Sourced from project/character/silas/image/
```

---

## 4. Strict YAML Integrity Rules

To prevent game crashes and parser exceptions, always validate the following rules:

> [!IMPORTANT]
> **YAML Syntax Rules:**
> *   **No Tabs:** Indent exclusively using spaces. The standard indentation is `2 spaces` per depth level.
> *   **Quote Your Dialogue:** Always enclose the `text` field in double quotes `""`. This escapes internal punctuation like apostrophes, colons, or commas.
> *   **Unique Node Keys:** Never duplicate a node ID within the same file.
> *   **Valid Character References:** All character IDs used in `left_character`, `right_character`, and `speaker` fields must match keys defined in `Assets/ConversationData/conversations.yaml`.
> *   **Sourced Character Data**: New characters must be registered in `conversations.yaml` using name/color/image data sourced from the `project/character` folder.
> *   **Valid Background Reference:** The `background` field must match a background key registered in `conversations.yaml`.
> *   **Numerical Dialogue Routing:** All `next_dialogue` routes must be integers corresponding to the registered conversation number keys under `conversations` in `conversations.yaml` (e.g., `1`, `2`, `3`, `4`).
> *   **Explicit Closures:** Every dialogue chain must end either with `next: null` or a transition using `next_dialogue`. Never leave a chain hanging without a termination key.


---

## 5. Showcase Example Scene

Below is a complete, syntactically perfect scene YAML demonstrating the **Branch & Merge** pattern and **Branch & Exit** scene transitions.

```yaml
start_node: "node_intro"
background: "garden"
left_character: "maya"
right_character: "yuki"
nodes:
  node_intro:
    speaker: "narrator"
    text: "The heavy iron gates of the Luminescent Garden creak open, exposing paths paved with glowing silica sands."
    next: "node_maya_greeting"

  node_maya_greeting:
    speaker: "maya"
    text: "Incredible... The cyber-flora here are actually synthesizing bioluminescent pigments in real time."
    next: "node_yuki_caution"

  node_yuki_caution:
    speaker: "yuki"
    text: "Careful, Maya. Some of these petals are coded with corrosive data-streams. Don't touch anything glowing too brightly."
    next: "node_prompt_choice"

  node_prompt_choice:
    speaker: "narrator"
    text: "Maya stretches her hand toward a shimmering violet cyber-rose. What do you do?"
    choices:
      - text: "Warn her sharply to step back."
        next: "node_branch_warn"
      - text: "Tease her about her reckless curiosity."
        next: "node_branch_tease"

  # --- Branch: Warn ---
  node_branch_warn:
    speaker: "yuki"
    text: "Maya, stop! That's a Tier-3 firewall rose. If it triggers, it'll brick your visor!"
    next: "node_branch_warn_response"

  node_branch_warn_response:
    speaker: "maya"
    text: "Whoa, okay! You didn't have to yell. I was just... appreciating the high-fidelity rendering."
    next: "node_merge_point"

  # --- Branch: Tease ---
  node_branch_tease:
    speaker: "yuki"
    text: "Go ahead, touch it. I'm sure rebuilding your neural deck from scratch is a fun weekend project."
    next: "node_branch_tease_response"

  node_branch_tease_response:
    speaker: "maya"
    text: "Hey! I am a professional developer, I know what I'm doing. Mostly. Fine, I'll keep my hands in my pockets."
    next: "node_merge_point"

  # --- Merge Point ---
  node_merge_point:
    speaker: "narrator"
    text: "The tension eases as the two friends walk deeper into the glowing digital foliage."
    next: "node_exit_prompt"

  node_exit_prompt:
    speaker: "yuki"
    text: "We've gathered enough flower data. Where should we head next?"
    choices:
      - text: "Return to the Cyber Lounge to analyze the data."
        next_dialogue: 1
      - text: "Explore the neon-lit Outskirts of the Village."
        next_dialogue: 2
      - text: "Rest in the garden for a while longer."
        next: null
```

---

## 6. Prompt Engineering Directives (For AI Gen)

If using an LLM to generate game-ready scene YAMLs, copy and paste this system prompt instruction:

```text
You are a Technical Writer and Dialogue Composer for an interactive Visual Novel.
Your task is to take a scene's conceptual design outline (.md profile) and translate it into a fully compliant, production-ready scene YAML file.

You must adhere to the following rules:
1. Parse-Ready YAML: Ensure the output is strictly valid YAML syntax. Do not output markdown commentary or wrapping around the YAML block, just the raw code.
2. Structure: Include start_node, background, left_character, right_character, and the complete nodes mapping.
3. Dialogue Escaping: Wrap all dialogue "text" fields in double quotes to avoid character escapes.
4. Indentation: Use exactly 2 spaces for indentation. Never use tabs.
5. Flow Logic: Implement the exact narrative choices and flow specified in the outline. Implement the Branch & Merge and Branch & Exit routes accurately. Every linear branch must connect to a valid next node key. Every end-point must explicitly terminate using next: null or shift to a new scene using next_dialogue: [number_id] where [number_id] is the target conversation number.
6. Characters & Setting: Match the characters and backgrounds to valid entries from the conversations.yaml file (e.g., characters: maya, yuki, narrator; backgrounds: lounge, village, garden, teaparty).
```
