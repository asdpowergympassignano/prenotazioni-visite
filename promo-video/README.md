# Power Gym Passignano: Reel 9:16

Brand animation di 25 s per Instagram Reel (1080×1920, 30 fps, audio AAC).
Il concept è questo: **logo → fulmine → energia nel bilanciere → luce → palestra → allenamento → ritorno al logo**.

## Il logo

Il logo viene disegnato dai tracciati originali di `assets/logo_rosso_sfondo_nero.svg`.
È il file ufficiale "ASD POWER GYM Passignano_rosso_sfondo nero.svg" dal Drive di A.S.D. Power Gym, copiato byte per byte (15356 byte).
Geometria e colori sono quelli originali: rosso `#EA545E` e bianco `#FFFFFF`.
Le animazioni lavorano solo su luce, maschere e camera. Nel finale (da 21.2 s a 24.2 s) il logo resta statico e pulito per 3 s.

## Struttura

| Tempo | Scena | Contenuto |
|---|---|---|
| 0–3 s | The Power Awakens | Nero, bagliore rosso, il bilanciere del logo emerge in macro. Il fulmine della P si attiva e un impulso corre dal centro ai lati. |
| 3–6 s | Logo Reveal | Pull-back: POWER si accende partendo dal fulmine, il bianco si accende e PASSIGNANO compare per ultimo. Ci sono raggi e particelle. |
| 6–11 s | Enter the Gym | Spinta dentro il fulmine (portale), poi montaggio: slow-mo, speed ramp, tagli veloci. |
| 11–16 s | The Power | STRENGTH, DISCIPLINE e PROGRESS cadono sul beat (11.4, 12.9 e 14.4 s). |
| 16–20 s | Community | Ritmo più largo e la scritta BUILD YOUR POWER. |
| 20–25 s | Final Brand Reveal | Nero, battito, fulmine rosso, logo fermo, BUILD YOUR POWER, PASSIGNANO SUL TRASIMENO, dissolvenza. |

## Slot video: dove vanno le riprese vere

Le scene 3, 4 e 5 hanno 14 slot. Se uno slot non ha un clip, viene usato un fallback in grafica 3D-look (bilanciere, dischi, manubri, sala).
**Per avere persone reali** basta mettere un file in `clips/` con il nome dello slot. Il renderer lo usa da solo: lo adatta al 9:16, gli applica la color grade rossa e lo speed ramp.

Ogni clip deve essere verticale (o almeno 9:16 ritagliabile), lungo 3–5 s, senza audio. Le riprese a 60 fps o più rendono meglio lo slow-mo.

| File in `clips/` | Durata nel video | Ripresa |
|---|---|---|
| `s3a_mani_bilanciere.mp4` | 6.4–7.6 | Mani che stringono il bilanciere, magnesite, slow motion |
| `s3b_dischi.mp4` | 7.6–8.5 | Disco caricato sul bilanciere fino all'impatto col collare |
| `s3c_scarpe_pavimento.mp4` | 8.5–8.8 | Scarpe che spingono sul pavimento in gomma (stacco) |
| `s3d_presa_magnesite.mp4` | 8.8–9.1 | Nuvola di magnesite dalle mani |
| `s3e_muscoli_sudore.mp4` | 9.1–10.1 | Dorso/spalle in contrazione, sudore, sguardo concentrato |
| `s3f_sala_macchine.mp4` | 10.1–11.0 | Macchina isotonica in movimento, sala pesi sullo sfondo |
| `s4a_montaggio_1.mp4` … `s4f_montaggio_6.mp4` | 11–16 | Persone diverse per età e fisico: squat, stacco, panca, functional, cardio |
| `s5a_istruttore.mp4` | 16–18 | Istruttore che corregge un iscritto |
| `s5b_community.mp4` | 18–20 | Iscritti che si allenano insieme, cinque, sorrisi, atmosfera |

### Prompt per generare gli slot con AI video (Higgsfield / Kling / Seedance)

Lo stile è comune a tutti i prompt; aggiungilo in coda a ciascuno:

> vertical 9:16, premium fitness commercial, dark gym with black walls, red accent rim light, volumetric haze, cinematic shallow depth of field, realistic skin and anatomy, realistic equipment, natural motion, anamorphic contrast, no text, no logos

- **s3a**: Extreme close-up of chalked hands gripping a knurled steel barbell, fingers tightening, chalk dust falling, slow motion 120fps.
- **s3b**: Macro shot of a black bumper plate sliding onto a chrome barbell sleeve and hitting the collar, speed ramp from fast to slow motion, chalk dust burst.
- **s3c**: Low angle close-up of training shoes pushing hard into black rubber gym flooring during a heavy squat, tiny dust lift.
- **s3d**: Hands clapping chalk, white powder cloud backlit by red light, slow motion.
- **s3e**: Close-up of an athlete's back and shoulders contracting during a heavy row, sweat beads, intense concentration, slow motion.
- **s3f**: Smooth dolly past a cable machine in motion, weight stack lifting, weight room in the background.
- **s4a–s4f**: Short dynamic shots of different people (a 20-year-old woman squatting, a 50-year-old man deadlifting, a young athlete on a bench press, a functional training circuit, an indoor cycling session, a mature woman doing kettlebell swings). Fast whip pans, speed ramps.
- **s5a**: Personal trainer correcting a member's squat form, supportive and smiling, warm human moment in a dark premium gym.
- **s5b**: Group of members of mixed ages training together and high-fiving between sets, sense of community, slow push-in.

Lo slot `s5a` funziona meglio con una ripresa reale della palestra e dei vostri istruttori: rende più credibile il messaggio "This is our place".

## Comandi

```bash
node build-logo-data.js     # rigenera assets/logo-data.js dall'SVG ufficiale
node audio.js               # colonna sonora → build/audio.wav
node render.js              # video completo → build/powergym_reel.mp4
node render.js --frames 2,5.5,22   # solo fotogrammi di controllo (build/still_*.jpg)
```

`render.js` usa Playwright (Chromium) e ffmpeg.
Per un'anteprima in tempo reale apri `index.html` in Chrome e premi PLAY. Con file:// serve `--allow-file-access-from-files`, altrimenti usa `npx serve`.
