---
name: story-scene-design
description: Core guidelines, structural outlining rules, and narrative checklists for designing visual novel scene descriptions and saving them to .md files under structured Scene_[number]_name folders.
---
# Skill: Visual Novel Story Scene Design Engine

This document defines the core guidelines, narrative frameworks, and production checklists for designing visual novel story scene profiles. Use this "skill" to structure story planning, outline pacing beats, and map out choice mechanics before coding them into dialogue files.

### Target Output Location
When designing a new scene, compile and save its narrative profile to:
`project/scene/Scene_[number]_[name]/Scene_[number]_[name].md` (where `[number]` is the sequential scene number, and `[name]` is the lowercase name of the scene, e.g. `project/scene/Scene_4_Garden/Scene_4_garden.md`).

---

## 1. Design Philosophy: The Dramatic Scene Beats Engine

An interactive visual novel scene is more than just a list of lines. It is a **dramatic unit** of story where players make decisions that test character dynamics. Every scene outline must balance four key components:

### A. Setting & Mood Anchor
Because visual novels rely on background art to set the scene, the design must establish a concrete physical place and a distinct atmosphere:
*   **The Backdrop:** A description of the background setting (mapping to a background key in the project).
*   **Sensory Vibe:** The key sounds, lighting notes, and visual cues that define the mood (e.g., neon humming, rainfall tapping, flickering fluorescent bulbs).

### B. Stage Casting
Clearly outline which characters are on stage and how they are positioned visually:
*   **Left vs. Right Positions:** Establishing who occupies the visual focus slots on screen.
*   **Narrative Goal:** The core objective or resolution of this specific scene (e.g., finding clues, having a late-night bonding session, resolving an argument).

### C. Character Friction (Want vs. Need Clashes)
A scene's narrative friction relies heavily on the tension between characters' individual **Wants** and **Needs** (from the `character-design` skill):
*   **Want Clash:** How do the characters' immediate external goals clash in this specific scene?
*   **Need Opportunities:** How does the scene's central conflict create branching choice points where a character is forced to either pursue their selfish *Want* or move toward their internal *Need*?

### D. Choice & Route Architecture
Every scene outline must map the interactive layout:
*   **The Spark Beat:** The incident that forces a choice.
*   **Choice Points:** The specific options presented to the player, along with their immediate emotional consequences.
*   **Pacing Branches:** Outlining the short "Branch & Merge" outcomes, or "Branch & Exit" transitions to other scenes using numerical references.

---

## 2. Standard Scene Design Template

Copy the markdown block below to document and plan new scenes.

```markdown
# Scene Design: Scene_[Number]_[Name]

## 1. Setting & Atmosphere
* *Background Reference:* (e.g., lounge / garden / village)
* *Sensory Details:* (e.g., Flickering purple neon glow, soft sound of typing, smell of coffee)
* *Overall Mood:* (e.g., Cozy comfort, mounting tension, competitive banter)

---

## 2. Stage Setup & Casting
* *Left Character:* (e.g., Maya - active/energetic)
* *Right Character:* (e.g., Yuki - reserved/composed)
* *The Core Beat:* (What is the narrative objective of this scene?)

---

## 3. Character Friction (Want vs. Need Clashes)
How do the characters' underlying motivations clash in this specific scene?

* **[Left Character Name] Want vs. Need:**
  * *Want in this scene:* (What do they want right now? e.g., Maya wants to prove she can beat the boss immediately.)
  * *Need in this scene:* (What growth do they need? e.g., Maya needs to slow down and listen to others' advice.)
* **[Right Character Name] Want vs. Need:**
  * *Want in this scene:* (What do they want right now? e.g., Yuki wants peace and quiet to play her game.)
  * *Need in this scene:* (What growth do they need? e.g., Yuki needs to learn to open up and share her space.)

---

## 4. Narrative Pacing & Choice Flow
Outline the structural beats of the scene.

### Progression Beats
* **Beat 1: The Inciting Beat** (How the scene starts and establishes the mood)
* **Beat 2: The Rising Tension** (The build-up leading to the choice)
* **Beat 3: The Climax / Decision Point** (The dilemma presented to the player)

### Branching Choice Matrix
Define the choices, button texts, and dialogue results.

* **Choice 1: [Short Title]**
  * *Button Text:* "..."
  * *Narrative Effect:* (What happens immediately on screen?)
  * *Psychological Value:* (Does it feed the Want or foster the Need?)
  * *Routing:* (e.g., Branch & Merge back to Beat 4 / Branch & Exit to new scene by number)

* **Choice 2: [Short Title]**
  * *Button Text:* "..."
  * *Narrative Effect:* (What happens immediately on screen?)
  * *Psychological Value:* (Does it feed the Want or foster the Need?)
  * *Routing:* (e.g., Branch & Merge back to Beat 4 / Branch & Exit to new scene by number)

### Exit Routes & Scene Transitions
Where does the player go from here?
* *Exit to Scene [Number 1]:* (e.g., Transition to [Scene_1_Lounge/Scene_1_lounge.md](file:///project/scene/Scene_1_Lounge/Scene_1_lounge.md))
* *Exit to Scene [Number 2]:* (e.g., Transition to [Scene_2_Village/Scene_2_village.md](file:///project/scene/Scene_2_Village/Scene_2_village.md))
* *Exit 3:* (e.g., Stay here / Terminal End)
```

---

## 3. Showcase Example Scene Profile: Scene_4_Garden

> [!TIP]
> Use this reference profile to guide the depth, narrative tone, and psychological tension of your scene designs.

# Scene Design: Scene_4_Garden

## 1. Setting & Atmosphere
* *Background Reference:* `garden`
* *Sensory Details:* Soft hum of digital pollen streams, bioluminescent purple and cyan plants pulsing in time with the wind, damp cool virtual mist.
* *Overall Mood:* Mysterious, serene, with a faint undercurrent of technological danger.

---

## 2. Stage Setup & Casting
* *Left Character:* `maya`
* *Right Character:* `yuki`
* *The Core Beat:* The friends explore the restricted Luminescent Garden. Maya is drawn to a highly volatile cyber-flora specimen, forcing the player to decide how to handle her reckless curiosity.

---

## 3. Character Friction (Want vs. Need Clashes)

* **Maya (The Energetic Hacker) Want vs. Need:**
  * *Want in this scene:* To touch and extract data directly from the shimmering violet cyber-rose, regardless of safety warnings.
  * *Need in this scene:* To slow down and listen to Yuki's technical knowledge of structural firewalls instead of rushing in.
* **Yuki (The Analytical Guard) Want vs. Need:**
  * *Want in this scene:* To strictly enforce the garden protocol and prevent any external interactions with the cyber-flora.
  * *Need in this scene:* To express her concern for Maya's safety warmly, rather than using cold authority which makes Maya defensive.

---

## 4. Narrative Pacing & Choice Flow

### Progression Beats
* **Beat 1: The Inciting Beat:** The garden gates open. Maya is immediately captivated by the bioluminescent cyber-flora.
* **Beat 2: The Rising Tension:** Maya steps forward and reaches her hand out toward a highly dangerous Tier-3 firewall rose. Yuki spots this and prepares to react.
* **Beat 3: The Climax / Decision Point:** The player must choose how Yuki responds to Maya reaching for the rose.

### Branching Choice Matrix

* **Choice 1: High-Speed Warning (Safety Protocol)**
  * *Button Text:* "Warn her sharply to step back."
  * *Narrative Effect:* Yuki yells at Maya, stating it is a Tier-3 firewall rose that will brick her visor. Maya pulls back, embarrassed and annoyed at the aggressive tone.
  * *Psychological Value:* Caters to Yuki's *Want* (safety first) but fails her *Need* (alienates Maya).
  * *Routing:* Branch & Merge into **Beat 4 (The Calm Path)**.

* **Choice 2: Playful/Teasing Warning (Cooperative Trust)**
  * *Button Text:* "Tease her about her reckless curiosity."
  * *Narrative Effect:* Yuki teasingly tells Maya to go ahead, joking that rebuilding her neural deck is a fun weekend project. Maya laughs, realizing the risk, and pulls back in good humor.
  * *Psychological Value:* Fosters the *Need of both characters* (Yuki communicates softly; Maya listens and respects the danger).
  * *Routing:* Branch & Merge into **Beat 4 (The Calm Path)**.

### Exit Routes & Scene Transitions
* *Exit 1:* Return to the lounge to analyze flower data -> Transition to Scene 1 ([Scene_1_Lounge/Scene_1_lounge.md](file:///project/scene/Scene_1_Lounge/Scene_1_lounge.md))
* *Exit 2:* Explore the neon outskirts -> Transition to Scene 2 ([Scene_2_Village/Scene_2_village.md](file:///project/scene/Scene_2_Village/Scene_2_village.md))
* *Exit 3:* Stay in the garden -> Terminal End (`next: null`)

---

## 5. Prompt Engineering Directives (For AI Gen)

If using an LLM to generate narrative scene designs, copy and paste this system prompt instruction:

```text
You are a lead Narrative Designer and Visual Novel Director.
Your task is to generate a comprehensive Scene Design Profile based on the provided story beat, setting, scene number, and characters.

You must structure the scene exactly following the standard Scene Design Template, ensuring:
1. File Path: The output is designed to be saved strictly as project/scene/Scene_[number]_[name]/Scene_[number]_[name].md.
2. Setting & Atmosphere details establish clear sensory triggers (sights, sounds, colors) suited for visual novels.
3. Stage Casting outlines clear left and right character placements and a focused narrative goal.
4. Character Friction explicitly maps the clash between the characters' internal "Wants" and "Needs" in this specific scenario.
5. The Choice Flow structures a pivotal player decision point where the choices reflect this psychological Want/Need conflict, describing the direct emotional consequences and scene outcomes, with branching/exit routing referencing the target scene numbers.
```
