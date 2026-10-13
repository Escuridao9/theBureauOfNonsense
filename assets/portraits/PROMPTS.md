# Applicant portrait assets

The portraits were generated using the built-in image generation tool. They use simplified cartoon shapes, flat colours, chunky outlines and awkward ID-photo expressions.

Each PNG is a three-column, three-row portrait sheet. Slots 0–7 are read left to right, then top to bottom. Slot 8 is blank. Every applicant's `portrait.sheet` and `portrait.slot` in `data/applications.json` select their image. The browser clips the selected cell into the identification frame; there is no runtime image processing.

| Sheet | Applicants in slot order |
| --- | --- |
| `vehicles.png` | Aurelia, Percival, Matilda, Orson, Beatrice, Felix, Hector, Juniper |
| `travel.png` | Edmund, Nora, Silas, Viola, Basil, Clementine, Dorian, Rosalind |
| `ghosts.png` | Agnes, Mortimer, Lydia, Rupert, Eveline, Oswald, Cora, Ambrose |

The image frame clips all artwork, including Aurelia's flame. Missing or invalid portrait metadata and failed image loads fall back to the applicant's initials. The species/occupation line uses the handwritten Caveat font.

The artwork is presentation metadata. Application fields, quotations, regulations and scoring are independent of it.

## Generation prompts

The vehicles sheet was generated first and simplified with the second prompt. Its simplified version was the visual reference for the travel and ghosts sheets.

### Vehicles Original

Use case: stylized-concept.
Asset type: production game portrait atlas for The Bureau of Nonsense.
Create one square raster sprite atlas in an EXACT edge-to-edge 3 columns by 3 rows layout of equal square cells, ideally 1536 x 1536 pixels. Each cell is its own awkward cartoon ID photo on the same flat pale grey-green backdrop. NO gutters, frames, captions, names, letters, text, or watermark. Last cell (bottom right) stays empty with the same backdrop. The eight occupied cells must be in precisely this reading order:
Top left: Aurelia Cinder, a female rusty orange dragon with small horns, caught mid-sneeze with squeezed eyes and a short orange fire puff. Her entire body and ALL FIRE remain well inside her own cell, with generous safety margin.
Top middle: Percival Drift, a pale blue cloud whale, round simple whale head with cloud-like silhouette, caught mid-blink with an awkward apologetic smile.
Top right: Matilda Brass, an anthropomorphic brass steam carriage viewed from the front, two windows as sleepy eyes, crooked grille smile, small chimney, very simple readable shape.
Middle left: Orson Featherwick, a brown giant owl courier with rumpled feathers and one eyelid drooping.
Middle middle: Beatrice Hush, an anthropomorphic upholstered plum armchair, face on its back cushion, mild awkward toothy smile, tiny wings contained in cell.
Middle right: Felix Ember, a green dragon chimney inspector in a small work cap, crooked smile, simple soot smudge on cheek.
Bottom left: Hector Bellweather, an anthropomorphic cream weather balloon, sleepy eyes and crooked smile on the balloon, small instrument basket.
Bottom middle: Juniper Vale, a witch librarian with messy dark hair, round glasses slightly askew and a crooked friendly smile, a simple dark pointed hat.
Style for every cell: very simplified chunky cartoon, flat limited colours, thick dark ink outlines, blocky geometric shapes approaching pixel art but NOT tiny pixel sprites. Adult quirky characters, deliberately low detail, almost no shading, no realistic skin/fur/scales, no gradients or glossy 3D. Small unflattering candid ID expressions: mid-blink, uneven smile, rumpled clothing. They must remain readable at 70 pixels square. Head/upper-body portraits for living creatures; simple front views for vehicles/furniture/balloon. Comfortable familiar slightly shabby office tone, no horror. Character artwork occupies roughly the middle 70 percent of each cell; all features and effects remain contained in its cell. Atlas alignment and reading order are essential.

### Vehicles Simplification

Use case: style-transfer. Edit this portrait atlas to make the artwork significantly simpler and chunkier, approaching pixel art while remaining cartoon illustration. Keep the exact 3 by 3 grid, cell boundaries, character order and identities, the eight portraits and empty bottom-right cell, and their current expressions. Keep Aurelia sneezing a small fire puff fully INSIDE the top-left photo. Replace intricate linework, scales, feathers, upholstery detail, hair strands and metallic texture with a few broad flat colour blocks and thick simple outlines. Use hard blocky stepped contours, deliberately low detail, about 6 flat colours per character and at most one broad shadow colour. No grain, no gradients, no airbrushing, no thin lines, no individual feathers or scales, no decorative textures. Less rounded and polished; charming awkward game ID sprites. Faces must be immediately legible at 65 pixels. Preserve species silhouettes and a plain muted grey-green photo background. Keep every character within its own photo cell. No words, labels, borders, gutters or watermark.

### Travel

Use case: stylized-concept. Derive a NEW portrait atlas from this reference, replacing all eight characters with the characters listed below. Preserve the reference's square canvas, EXACT 3 columns by 3 rows of equal square photo cells, plain muted grey-green background, empty bottom-right cell, chunky flat-colour style, thick outlines and blocky almost-pixel contours. No text, labels, captions, frames, gutters or watermark. The style should be low detail, adult whimsical game characters, about 6 broad colours per portrait, almost no shading, no realistic lighting or fine textures. Small awkward candid expressions, head and shoulders, clearly legible at 65 pixels. All clothing, hair and props must stay within their own cell. Keep the character reading order exactly as listed, left to right then top to bottom. Top left: Edmund Elsewhere, older male wizard lecturer, rumpled blue pointed hat, bushy grey eyebrows and moustache, caught mid-sneeze without any fire. Top middle: Nora Pocket, middle-aged woman stamp enthusiast with a simple auburn bob, cardigan and an awkward too-tight smile. Top right: Silas Moonsworth, male astronomer with unruly dark hair, round glasses slightly askew and a surprised mid-blink expression. Middle left: Viola Trunk, pale female vampire musician with dark violet bob, tiny fangs and crooked friendly smile, no horror. Middle middle: Basil Yesterday, male time traveller with messy sandy hair, a brown coat and goggles on forehead, yawning with one eye half open. Middle right: Clementine Fold, anthropomorphic origami crane courier, face made from simple folded cream paper, small crooked beak smile and lopsided eyes. Bottom left: Dorian Approximate, balding male amateur geographer with an uneven moustache, simple green jacket and uncertain toothy smile. Bottom middle: Rosalind Finch, young adult sorceress with unkempt reddish hair, small star-shaped hair clip, blue scarf and a slightly awkward squinting smile. Bottom right EMPTY plain grey-green background.

### Ghosts

Use case: stylized-concept. Derive a NEW portrait atlas from this reference, replacing all eight characters with the characters listed below. Preserve the reference's square canvas, EXACT 3 columns by 3 rows of equal square photo cells, plain muted grey-green background, empty bottom-right cell, chunky flat-colour style, thick outlines and blocky almost-pixel contours. No text, labels, captions, frames, gutters or watermark. The style should be low detail, adult whimsical game characters, about 6 broad colours per portrait, almost no shading, no realistic lighting or fine textures. Small awkward candid expressions, head and shoulders, clearly legible at 65 pixels. All clothing, hair and props must stay within their own cell. Keep the character reading order exactly as listed, left to right then top to bottom. Top left: Agnes Rattle, elderly female ghost librarian with pale mint face, a grey bun, square spectacles and one eyelid drooping; stern but kind. Top middle: Mortimer Clank, male ivory-coloured spectre chain collector in an old dark collar with a SMALL simple chain around shoulders; distinctly cheeky MISCHIEVOUS smile and one raised eyebrow. Top right: Lydia Dawn, pale blue female ghost early riser with untidy pale blond hair, caught mid-yawn. Middle left: Rupert Uninvited, scruffy male poltergeist with wispy dark hair, uneven moustache and a startled awkward smile. Middle middle: Eveline Still, female cool mint ghost professional with neatly tied-back dark hair, tidy simple collar and an unexpectedly lopsided tight smile. Middle right: Oswald Echo, pale lilac male phantom with tousled grey hair, simple scarf and an awkward open-mouthed grin. Bottom left: Cora Candlewick, female pale peach ghost with messy copper hair, warm cardigan and crooked friendly smile; one tiny unlit candle low in the photo, contained entirely in cell. Bottom middle: Ambrose Excess, male teal poltergeist newcomer with dishevelled dark hair and an enthusiastic uneven toothy grin, comical rather than frightening. Bottom right EMPTY plain grey-green background. Everyone must look distinct and friendly, no skulls, horror, glowing effects or realism.


## Expression revision

These edits retain the character identities, cell order and illustration style, but match their expressions to their application quotes. Aurelia keeps her contained fire sneeze and Mortimer keeps his mischievous smile. The gameplay code and application text are unchanged.

All three sheets were edited with the built-in image generation tool, using the previous sheet as the image reference. Each sheet remains a 3 by 3 grid with an empty bottom-right cell.

### Vehicles expression edit

```text
Edit the supplied portrait atlas. Keep the same characters, casting, species, clothing, accessories, limited muted colour palette, chunky almost-pixel cartoon style, thick stepped dark outlines, flat shading and pale grey-green background. This is a finished small ID-photo asset for a cosy whimsical bureaucracy game. Change facial expressions and modest body posture only, following the individual directions below. Preserve the EXACT existing 3-column by 3-row equally sized atlas layout: eight characters in the same slots, read left to right, top to bottom; bottom-right ninth slot is EMPTY background. Each cell is its own self-contained ID photograph, no gutters or border lines. Keep every character, prop and effect wholly inside its original cell. No captions, letters, labels, symbols for emotions, new characters or extra decoration. Expressions must read at a tiny 68px photo size through distinct mouths, eyes and brows, not just different gaze directions. In particular eliminate the repeated crooked toothy grin and half-closed eye formula. A deliberate happy character may smile, but closed-mouth composure, wide-eye surprise, sternness, weariness and exasperation need their own clear shapes. Preserve the handmade, simple, funny, appealing drawing style of the reference; do not make it more detailed or realistic.
VEHICLES atlas, per slot:
1 TOP LEFT Aurelia Cinder, red dragon: keep this accepted fire sneeze essentially unchanged. Eyes squeezed shut mid-sneeze and small fire jet, with ALL flames inside this top-left photo cell. Do not enlarge or let flames cross into the whale.
2 TOP MIDDLE Percival Drift, blue cloud whale, quote "I travelled light. Most of my luggage evaporated.": serene and blithely pleased at having less luggage. Both eyes peacefully relaxed, a tiny CLOSED-mouth contented curve, no exposed teeth or cheeky smirk. Preserve whale and clouds.
3 TOP RIGHT Matilda Brass, gold steam carriage, quote "The chimney is decorative. The smoke is performance art.": deadpan defensive innocence. Straight/level windshield brows, flat closed grille-mouth, level attentive eyes, expression of "what smoke?" Keep the existing chimney smoke and carriage identity.
4 MIDDLE LEFT Orson Featherwick, owl night courier, quote about turning his head backwards not counting as checking mirrors: mildly baffled and indignant, one lifted inquisitive brow and the other slightly knitted, eyes open, beak slightly open in protest, a modest questioning head tilt. No toothy grin.
5 MIDDLE CENTRE Beatrice Hush, purple winged armchair, quote "After forty years of supporting people, I'd like the building to return the favour.": the KEY change. Remove the toothy grin completely. She is tired, underappreciated, dignified and quietly hopeful. Heavy upper eyelids with small attentive pupils, soft tired raised inner brows, a small closed pleading mouth with a faint downward/uneven curve, sagging cushion and gently drooping armrests/wings. Look like a patient exhausted retired chair asking for a little support, not a smiling schemer or a sobbing caricature. Keep enough gentle hope to be sympathetic.
6 MIDDLE RIGHT Felix Ember, green dragon chimney inspector, quote "I used to be blamed for chimney fires. Now I charge an inspection fee.": confidently smug businessman; a deliberate self-satisfied toothy smile with chin a little lifted, one knowing eyebrow. Keep hat and chimney brush. A grin belongs to THIS character.
7 BOTTOM LEFT Hector Bellweather, cream weather balloon, quote about air being public property: sincerely puzzled, round open eyes, unequal questioning brows, small clearly rounded O mouth, no smile or teeth. Preserve balloon basket and clock.
8 BOTTOM MIDDLE Juniper Vale, bespectacled witch travelling librarian, quote about her cat refusing to be itemised: frazzled resigned exasperation. Both eyes looking wearily upward, glasses subtly askew, a short flat closed mouth/pressed lips and one tired brow, not a toothy smile. Keep hat, unruly hair and stack of books.
9 BOTTOM RIGHT remains completely blank background.
Do not change the grid order or replace the chair with a humanoid. The emotional contrast should be immediately visible across the sheet.
```

### Travel expression edit

```text
Edit the supplied portrait atlas. Keep the same characters, casting, species, clothing, accessories, limited muted colour palette, chunky almost-pixel cartoon style, thick stepped dark outlines, flat shading and pale grey-green background. This is a finished small ID-photo asset for a cosy whimsical bureaucracy game. Change facial expressions and modest body posture only, following the individual directions below. Preserve the EXACT existing 3-column by 3-row equally sized atlas layout: eight characters in the same slots, read left to right, top to bottom; bottom-right ninth slot is EMPTY background. Each cell is its own self-contained ID photograph, no gutters or border lines. Keep every character, prop and effect wholly inside its original cell. No captions, letters, labels, symbols for emotions, new characters or extra decoration. Expressions must read at a tiny 68px photo size through distinct mouths, eyes and brows, not just different gaze directions. In particular eliminate the repeated crooked toothy grin and half-closed eye formula. A deliberate happy character may smile, but closed-mouth composure, wide-eye surprise, sternness, weariness and exasperation need their own clear shapes. Preserve the handmade, simple, funny, appealing drawing style of the reference; do not make it more detailed or realistic.
TRAVEL atlas, per slot:
1 TOP LEFT Edmund Elsewhere, older blue-hatted wizard lecturer, quote "The lecture starts in three minutes. My explanation for being late runs to forty.": flustered urgency, both eyes wide with high alarmed brows, mouth small and open mid-explanation. Remove the generic sneeze, squint and sneeze-lines. Preserve beard and rumpled blue hat.
2 TOP MIDDLE Nora Pocket, auburn-bob human stamp collector, forty kilograms of "essential" stamps: proudly enthusiastic about her album. Both eyes bright and open, an earnest delighted rounded smile, relaxed raised cheeks; not a crooked sly half-lidded grin. Keep album in hands and clothing.
3 TOP RIGHT Silas Moonsworth, scruffy astronomer with round glasses and telescope, optimistic Moon destination loophole: eager tentative hope. Both eyes open in wonder, raised questioning brows and a small uncertain CLOSED-mouth smile as if saying "surely that counts?" No wink or bored eye.
4 MIDDLE LEFT Viola Trunk, dark-haired vampire musician, coffin and piano both supposedly carry-on: imperiously unimpressed and entitled, chin slightly raised, level half-lidded eyes, closed pursed lips with just a subtle fang if appropriate. Remove the broad toothy grin. Keep her instrument case and vampire identity.
5 MIDDLE MIDDLE Basil Yesterday, orange-haired time traveller with goggles, scarf and pocketwatch, already renewed next Tuesday: amused condescending confidence. Both eyes alert, one knowing lifted eyebrow and a small confident asymmetric CLOSED-mouth smirk. Remove the yawn and hand over mouth; lower the gloved hand slightly while preserving his outfit and watch.
6 MIDDLE RIGHT Clementine Fold, origami crane courier, neatly folds rules into a swan: clever quiet pride. Alert neat open eyes and a tiny satisfied closed-beak crease/curve, no human teeth. Preserve the folded-paper crane, angular origami face, courier bag and scarf.
7 BOTTOM LEFT Dorian Approximate, bald moustached human geographer, insists Oldest Town should qualify before Old Town: earnestly stubborn and explaining his logic. Knitted focused brows, level open eyes, mouth a little open mid-argument below the moustache; no toothy grin. Keep rolled map.
8 BOTTOM MIDDLE Rosalind Finch, red-haired sorcerer with wand, pigeons insist on seeing her off: harried embarrassed politeness. Eyes glancing upward with a worried raised inner brow, a tiny tight CLOSED-mouth apologetic smile, shoulders a little tucked and hair unkempt. Remove the confident toothy grin. Preserve wand and scarf; do not add any birds or new props.
9 BOTTOM RIGHT blank background.
Emotions should form a varied set of panic, sincere delight, tentative hope, haughty refusal, confident knowingness, quiet pride, stubborn conviction and embarrassed politeness, without repeating a single facial template.
```

### Ghosts expression edit

```text
Edit the supplied portrait atlas. Keep the same characters, casting, species, clothing, accessories, limited muted colour palette, chunky almost-pixel cartoon style, thick stepped dark outlines, flat shading and pale grey-green background. This is a finished small ID-photo asset for a cosy whimsical bureaucracy game. Change facial expressions and modest body posture only, following the individual directions below. Preserve the EXACT existing 3-column by 3-row equally sized atlas layout: eight characters in the same slots, read left to right, top to bottom; bottom-right ninth slot is EMPTY background. Each cell is its own self-contained ID photograph, no gutters or border lines. Keep every character, prop and effect wholly inside its original cell. No captions, letters, labels, symbols for emotions, new characters or extra decoration. Expressions must read at a tiny 68px photo size through distinct mouths, eyes and brows, not just different gaze directions. In particular eliminate the repeated crooked toothy grin and half-closed eye formula. A deliberate happy character may smile, but closed-mouth composure, wide-eye surprise, sternness, weariness and exasperation need their own clear shapes. Preserve the handmade, simple, funny, appealing drawing style of the reference; do not make it more detailed or realistic.
GHOST atlas, per slot:
1 TOP LEFT Agnes Rattle, green ghost librarian with bun, spectacles and books, quote about still collecting overdue fines: stern and unimpressed. Knitted downturned brows, sharp level alert eyes looking over glasses, tight small CLOSED-mouth disapproving line. Upright authority, not tired or pleading. Preserve all styling.
2 TOP MIDDLE Mortimer Clank, cream chain-wearing spectre, chains as cultural heritage: PRESERVE the accepted mischievous cheeky toothy smile and raised eyebrow. Keep this cell essentially unchanged, same cream face and chain. This is the one deliberate naughty grin.
3 TOP RIGHT Lydia Dawn, blue ghost with pale wavy hair, offers wake-up calls that are screams: caught giving an energetic comic wake-up scream. Both eyes wide open, brows raised, one large round open O mouth, hand cupped beside mouth as she calls out. NOT sleepy closed eyes and a yawn. Funny rather than frightening; preserve blue body and pale hair.
4 MIDDLE LEFT Rupert Uninvited, scruffy moustached poltergeist in olive coat, not being asked to leave is encouraging: unwarranted optimistic friendliness. Both eyes wide and welcoming, sincere cheerful broad smile with relaxed upright hopeful posture, not worried brows or a sly side glance. Preserve moustache and coat.
5 MIDDLE MIDDLE Eveline Still, green professional ghost with dark neat hair and cameo, finishes haunting exactly at sixty minutes: composed dry businesslike deadpan. Level open attentive eyes, nearly straight brows, very small proper CLOSED-mouth line, upright elegant posture. Remove the toothy grin. Not angry, just calm and punctual.
6 MIDDLE RIGHT Oswald Echo, lavender messy-haired phantom with plum scarf, one hour barely enough for the atmosphere: theatrical put-upon disappointment. Drooping eyes and upward-curved inner brows, mouth visibly DOWNturned and slightly open in a sigh, shoulders slumped. No smiling/grinning mouth; not a horror face.
7 BOTTOM LEFT Cora Candlewick, ginger ghost holding existing candle, advises others to stop lighting candles: caught deliberately blowing out that candle. Small puckered O lips, slightly puffed cheeks, focused amused open eyes toward the candle. Keep candle and hand INSIDE her cell. No toothy grin, no extra effect symbols.
8 BOTTOM MIDDLE Ambrose Excess, turquoise messy-haired poltergeist newcomer, subtle haunting failed to cause complaints: crestfallen and overearnest, big questioning eyes, uncertain raised inner brows, small DOWNturned CLOSED mouth and slightly hunched shoulders. Remove the huge cheerful triumphant grin. He looks worried his effort wasn't noticed, comically hopeful rather than menacing.
9 BOTTOM RIGHT blank background.
Make expressions distinct and easy to read in tiny photos: stern, mischievous, loud scream, unwarranted friendly optimism, businesslike deadpan, disappointed sigh, pursed candle-blowing lips, worried newcomer.
```


## Gaze correction

The first expression edit repeated a sideways gaze. A second pass gives most applicants direct eye contact and reserves other gazes for their personality or activity. The following are the exact prompts used to create the final sheets.

### Vehicles gaze edit

```text
Make a precise gaze-direction correction to this existing 3x3 cartoon portrait atlas. The existing distinct emotional expressions are good; preserve their mouths, eyebrows, character identities, outfit details, props, chunky stepped dark outlines, flat muted colours, pale grey-green backgrounds and 3x3 cell boundaries. Eight characters stay in their exact original slots; bottom-right is blank. NO text, captions or extra symbols. The specific mistake to fix is that nearly all pupils are at the right edge of their eyes, making everyone look to the right. DO NOT repeat this. For any character instructed to look directly at the camera, put BOTH pupils centrally within their visible eyes and orient the face toward the viewer, as in a candid ID photo. Straight at the CAMERA means toward the person looking at this image, not toward the character in the neighbouring cell. Adjust head orientation modestly if needed so direct eye contact is visually unambiguous. A direct gaze is compatible with the existing individual emotions: do NOT turn everyone into the same neutral expression or smile. Keep the few intentional other gazes indicated below. Every character and effect stays entirely inside its own cell. Make this an exact asset edit, not a redesigned scene.
VEHICLES reading row by row:
TOP LEFT red dragon Aurelia: keep the fire sneeze exactly as it is, squeezed-shut eyes. ALL fire inside this cell.
TOP MIDDLE blue cloud whale Percival: keep both eyes peacefully closed and the serene small closed-mouth smile.
TOP RIGHT gold steam carriage Matilda: BOTH windshield pupils CENTRAL, looking directly at CAMERA. Keep level deadpan brows and straight mouth.
MIDDLE LEFT brown owl Orson: his head may remain inquisitively tilted, but BOTH pupils look directly at CAMERA rather than to the side. Keep baffled/indignant brows and slightly open protesting beak.
MIDDLE CENTRE purple flying armchair Beatrice: BOTH pupils face directly at CAMERA as she asks the clerk for support. Preserve her heavy tired eyelids, drooping cushion, quietly pleading brows and small downturned closed mouth. No teeth or smile.
MIDDLE RIGHT green dragon Felix: modestly angle the head into a three-quarter ID-photo view toward the viewer, and give direct eye contact with CAMERA. Keep his deliberate smug businessman grin, hat and brush. Do not alter species or accessories.
BOTTOM LEFT cream weather balloon Hector: round eyes with BOTH pupils central, directly at CAMERA. Keep unequal puzzled brows and tiny O mouth; expression sincere confusion.
BOTTOM MIDDLE witch Juniper: retain her intentional upward eye-roll about the cat, eyes looking UP rather than sideways right. Keep closed frustrated mouth and glasses.
BOTTOM RIGHT blank.
Result: five applicants look directly at the viewer, two have intentionally closed eyes, and one rolls her eyes upward. They must not be a sheet of sideways glances.
```

### Travel gaze edit

```text
Make a precise gaze-direction correction to this existing 3x3 cartoon portrait atlas. The existing distinct emotional expressions are good; preserve their mouths, eyebrows, character identities, outfit details, props, chunky stepped dark outlines, flat muted colours, pale grey-green backgrounds and 3x3 cell boundaries. Eight characters stay in their exact original slots; bottom-right is blank. NO text, captions or extra symbols. The specific mistake to fix is that nearly all pupils are at the right edge of their eyes, making everyone look to the right. DO NOT repeat this. For any character instructed to look directly at the camera, put BOTH pupils centrally within their visible eyes and orient the face toward the viewer, as in a candid ID photo. Straight at the CAMERA means toward the person looking at this image, not toward the character in the neighbouring cell. Adjust head orientation modestly if needed so direct eye contact is visually unambiguous. A direct gaze is compatible with the existing individual emotions: do NOT turn everyone into the same neutral expression or smile. Keep the few intentional other gazes indicated below. Every character and effect stays entirely inside its own cell. Make this an exact asset edit, not a redesigned scene.
TRAVEL reading row by row. This sheet is especially important: no repeated gaze to the right. Six faces look directly at CAMERA, two have a specific different gaze:
TOP LEFT blue-hatted older wizard Edmund: DIRECT eye contact with CAMERA, both pupils central. Keep his alarmed wide eyes, urgent raised brows, open explanatory mouth and hand gesture.
TOP MIDDLE auburn-bob stamp collector Nora: look DOWN at the precious album she is clutching. Face mostly front, both pupils lowered toward the album. Keep her delighted open smile and enthusiasm. NOT sideways right.
TOP RIGHT bespectacled scruffy astronomer Silas: DIRECT eye contact with CAMERA, both pupils central behind round glasses. Keep eager hopeful brows and tentative tiny closed smile. Face front/three-quarter toward viewer, no sideways gaze.
MIDDLE LEFT vampire Viola: DIRECT eye contact with CAMERA with narrow unimpressed eyes. Keep haughty raised chin, pursed closed lips and tiny fang, arms folded and case. A disdainful stare AT the viewer, not past them.
MIDDLE CENTRE goggled time traveller Basil: DIRECT eye contact with CAMERA, both pupils central; keep one raised knowing brow and small confident smirk. Keep watch, goggles, scarf and gloved hand at chin.
MIDDLE RIGHT origami courier Clementine: rotate paper head into a front/three-quarter view toward CAMERA; both visible eyes meet the viewer. Keep folded crane identity, closed paper beak with NO teeth and small quiet-pride crease. Preserve scarf and courier bag.
BOTTOM LEFT moustached geographer Dorian: DIRECT eye contact with CAMERA; both pupils central, face toward viewer. Keep determined knitted brows, mouth open mid-explanation, finger pointing and rolled map. He is addressing the clerk.
BOTTOM MIDDLE ginger sorcerer Rosalind: face mostly front, her eyes glance UP and to her LEFT, embarrassed by the implied pigeons. Keep tiny tight closed smile, uncertain raised inner brow, wand and scarf. Do not add pigeons.
BOTTOM RIGHT blank.
The six direct looks must be obvious, with the eyes genuinely meeting the viewer instead of pupils pushed to a side. Preserve all eight DIFFERENT emotional expressions and mouths.
```

### Ghosts gaze edit

```text
Make a precise gaze-direction correction to this existing 3x3 cartoon portrait atlas. The existing distinct emotional expressions are good; preserve their mouths, eyebrows, character identities, outfit details, props, chunky stepped dark outlines, flat muted colours, pale grey-green backgrounds and 3x3 cell boundaries. Eight characters stay in their exact original slots; bottom-right is blank. NO text, captions or extra symbols. The specific mistake to fix is that nearly all pupils are at the right edge of their eyes, making everyone look to the right. DO NOT repeat this. For any character instructed to look directly at the camera, put BOTH pupils centrally within their visible eyes and orient the face toward the viewer, as in a candid ID photo. Straight at the CAMERA means toward the person looking at this image, not toward the character in the neighbouring cell. Adjust head orientation modestly if needed so direct eye contact is visually unambiguous. A direct gaze is compatible with the existing individual emotions: do NOT turn everyone into the same neutral expression or smile. Keep the few intentional other gazes indicated below. Every character and effect stays entirely inside its own cell. Make this an exact asset edit, not a redesigned scene.
GHOSTS reading row by row:
TOP LEFT bun-haired green librarian Agnes: BOTH pupils central with direct stern eye contact AT CAMERA over her spectacles. Keep knitted brow, closed displeased mouth and books.
TOP MIDDLE cream spectre Mortimer: keep his accepted mischievous smile and raised eyebrow essentially UNCHANGED. He may retain this single sly sideways glance; same chain, identity, colour.
TOP RIGHT blue screaming ghost Lydia: wide open eyes directed straight AT CAMERA with both pupils central. Keep huge round open scream mouth and hand cupped at side of mouth. She is calling at the viewer, not yawning.
MIDDLE LEFT moustached Rupert: DIRECT eye contact with CAMERA, both pupils central. Keep genuine broad friendly smile and optimistic open brows.
MIDDLE CENTRE dark neat-haired green professional Eveline: DIRECT eye contact with CAMERA, pupils central; preserve composed level eyes, calm straight brows and small straight closed mouth. Upright businesslike poise.
MIDDLE RIGHT lavender scarfed Oswald: look DOWN, in a theatrical disappointed sigh, not sideways. Keep drooping brows, clearly downturned open mouth and slumped shoulders.
BOTTOM LEFT ginger Cora: keep her deliberate gaze at her candle and puckered candle-blowing lips. This side gaze has a specific purpose and stays. Keep candle inside her own cell.
BOTTOM MIDDLE turquoise Ambrose: DIRECT eye contact with CAMERA, both pupils central; preserve uncertain raised inner brows, small downturned closed mouth and hunched posture.
BOTTOM RIGHT blank.
Five direct ID-photo gazes plus Mortimer's sly glance, Oswald's downcast disappointment and Cora's candle-focused gaze. Do not revert to matching half-lidded toothy faces.
```

