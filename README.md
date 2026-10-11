# The Bureau of Nonsense

The Bureau of Nonsense is a browser game about inspecting improbable applications under exceedingly specific regulations. Read the rulebook, approve compliant requests, or reject them and cite every broken rule.

Its desk combines handwritten typography, paper forms, stamps and a familiar office atmosphere. The project was developed with HTML5, CSS3 and JavaScript ES6+ for the practical assignment **Dynamic Web Application**.

**[Play on GitHub Pages](https://escuridao9.github.io/theBureauOfNonsense/)**

**[Source repository](https://github.com/Escuridao9/theBureauOfNonsense)**

## Features

- A start menu with New Campaign, Continue Campaign, Roll of Honour and Settings.
- Three campaign modes and an optional clerk name.
- Department-specific regulations and randomized application queues.
- Approval stamps and rejection forms with selectable regulations.
- Audit receipts explaining decisions and points awarded.
- Shift and final reports with an expandable paper trail.
- Separate records for each mode, with the ten best completed runs.
- Saved progress and sound preferences using `localStorage`.
- Independent controls for music, atmosphere, stamps and paper sounds.
- Sliding paper animation and reduced-motion support.
- Responsive layouts for desktop and mobile screens.
- A confirmed option to delete saved Bureau data.

## Campaign modes

| Mode | How it works |
| --- | --- |
| **Normal** | Three shifts and eighteen applications, with no timer. |
| **Under Pressure** | The same campaign, with twenty seconds to file each decision. The timer includes selecting rejection reasons; a missed deadline earns no points. |
| **Never-ending Paperwork** | Departments repeat with fresh queues. There is no timer, and the third wrong verdict ends the run. |

A correct verdict earns **10 points**. A fully justified inspection earns **5 additional points**, for a maximum of **15 points per application**. A perfect Normal or Under Pressure campaign scores **270 points**.

In Never-ending Paperwork, incomplete rejection reasons cost the bonus but do not add a warning when the verdict itself is correct.

## How to play

1. Choose **New Campaign**, select a mode and enter a clerk name if desired.
2. Read the department briefing and begin the shift.
3. Compare the application's fields with every regulation in the rulebook.
4. Approve the request if every rule is met. Otherwise, reject it and select every broken regulation.
5. Read the audit receipt, continue through the queue and review the shift report.

The Main menu pauses the timer in Under Pressure. The rejection form, Settings and the handbook leave it running.

| Key | Action |
| --- | --- |
| **A** | Approve the current application. |
| **R** | Open the rejection form. |
| **Enter** | Continue after an audit receipt. |

Shortcuts respect active forms and dialogs, so typing in an input does not stamp an application.

## Run locally

1. Clone or download the repository and open its folder in Visual Studio Code.
2. Install the [Live Server extension](https://github.com/ritwickdey/vscode-live-server).
3. Right-click `index.html` and select **Open with Live Server**.

The game opens in your browser through a local HTTP server. Serve the project over HTTP rather than opening `index.html` directly, because it uses JavaScript modules and loads its application data with `fetch()`.

The game has no build step and needs no framework or installed JavaScript dependencies.

## Saved data and Settings

Progress, completed records, the best Normal score and sound preferences are stored in this browser's `localStorage`. **Continue Campaign** restores an unfinished run, including briefings, applications, receipts and shift reports. Starting a new campaign preserves completed records.

Settings provides separate on/off switches and volume sliders for atmosphere, music, stamps and paper sounds. Browsers may require a click or key press before allowing audio playback.

To erase saved Bureau data, open **Settings → Clear saved data → Delete saved data**. Confirmation removes the saved campaign, records, best score and sound preferences, ends the active run, restores the default audio settings and returns to the menu. **Keep my records** cancels the operation.

Other open Bureau tabs reset when data is deleted, preventing an old session from saving erased progress again. Storage belonging to unrelated projects is preserved.

If browser storage is unavailable, the current visit remains playable and the interface explains that progress cannot be saved.

## Technologies and structure

- **HTML5:** semantic sections, forms, native dialogs, templates and audio elements.
- **CSS3:** custom properties, Grid, Flexbox, responsive layouts and motion preferences.
- **JavaScript ES6+:** modules, closures, array methods, asynchronous loading, DOM updates and browser storage.

| File or folder | Responsibility |
| --- | --- |
| `index.html` | Start menu, desk, dialogs, HTML templates and audio elements. |
| `css/style.css` | Handwritten appearance, paper components and responsive layouts. |
| `js/main.js` | Loading, user actions, screen transitions and clock updates. |
| `js/game.js` | Campaign state, queues, progression, deadlines and save restoration. |
| `js/rules.js` | Regulation checks, scoring, totals and field formatting. |
| `js/modes.js` | Campaign mode definitions and clerk-name normalization. |
| `js/ui.js` | Rendering documents, rules, receipts, reports, timers and records. |
| `js/storage.js` | Persistence, record validation, ranking and saved-data deletion. |
| `js/audio.js` | Native audio playback and per-channel preferences. |
| `data/applications.json` | Departments, regulations and applicants. |
| `assets/` | Fonts, sound files, font licenses and the favicon. |

## Assignment requirements

| Requirement | Implementation |
| --- | --- |
| **1. Logic and control flow** | Conditions and loops control campaign phases and decisions. `switch` handles field and rule types. `map()` builds rendered lists, `filter()` finds violations and `reduce()` calculates totals. |
| **2. Simple data manipulation** | Clerk names and regulation values are normalized; numbers and dates use `Intl`; boolean fields are converted to readable labels; volumes are validated and bounded. |
| **3. Complex data manipulation** | Object spread, copied arrays and `structuredClone()` protect state and returned data. Record ranking sorts a copied array, while filtering and adding records produces new collections. |
| **4. Dynamic DOM creation** | HTML templates are cloned and populated in `ui.js`. Rule cards are inserted with `appendChild()`; other generated collections use `replaceChildren()`. |
| **5. Reactivity and events** | Clicks, form submissions, keyboard shortcuts, volume inputs, toggles and record filters update the interface. Scores, timers and warning marks reflect the current run. |
| **6. Scope and closures** | Module scope and factory functions encapsulate campaign state, the storage ledger and audio preferences. Internal values remain accessible through controlled public methods. |
| **7. Asynchronous loading** | `main.js` loads `data/applications.json` with `fetch()` and `async/await`, checks the response and handles failures with `try/catch`, an error state and a retry button. |
| **8. Modularization and reuse** | Seven JavaScript modules use `import` and `export`. Shared functions handle formatting, assessment, mode definitions, storage, audio and rendering. |
| **Required persistence** | `localStorage` saves campaign progress, completed records and sound preferences. |
| **GitHub delivery** | The source is hosted in the public repository linked above, with a GitHub Pages link and local run instructions in this README. |

The assignment accepts a local JSON file as the asynchronous data source and allows either `localStorage` or `sessionStorage` for persistence. An external API and use of both storage mechanisms are not required.

## Verification

Development verification included 48 automated checks covering regulations, scoring, restoration, all three modes, deadlines, records, audio preferences and data deletion.

Browser checks cover complete campaigns, reload/Continue, timed deadlines, Endless warnings, data deletion across tabs, unavailable storage, native audio decoding, reduced motion and layouts from 320 to 1440 pixels wide.

## Credits

- Music: **The Five-Floor Goodbye**, by **Ryan Ike**, from the **Gunpoint** soundtrack.
- Fonts: **Caveat** and **Special Elite**. Their license files are included in `assets/fonts/`.
- Project: **Diogo Gomes** — [Escuridao9](https://github.com/Escuridao9).

