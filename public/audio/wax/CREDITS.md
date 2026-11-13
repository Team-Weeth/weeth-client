# Wax game sounds

## Wax ball (왁뿌볼) sounds — CC BY 4.0

> WAK-PPU-BALL sound effects by apple77771, licensed under CC BY 4.0.

- Title: WAK-PPU-BALL sound effects (12 MP3 files in `audio/`)
- Author: apple77771 — original recordings of real wax balls made by the author
- Source: https://github.com/apple77771/wakppuball-simulator (files taken from commit `6882bebcc312b3be3b871b0729e22ceacf5a2f01`, `audio/`; the author's notice is in `audio/LICENSE.md`)
- License: Creative Commons Attribution 4.0 International — https://creativecommons.org/licenses/by/4.0/
- Changes: the files in `wakppu/` are byte-identical copies. During play the game picks short excerpts around detected crack onsets, layers several excerpts for a big break, and changes their pitch and volume (Web Audio, at runtime). No endorsement by the author is implied.

| Local file                          | Use in game                                    |
| ----------------------------------- | ---------------------------------------------- |
| wakppu/apple_crack_1.mp3, \_2.mp3   | cracks for 딥 그린 두꺼운 왁스, 레드 마블      |
| wakppu/balloon_crack_1.mp3, \_2.mp3 | cracks for 파스텔 핑크 3겹, 옐로 유광, 핑크 펄 |
| wakppu/butter_crack_1.mp3, \_2.mp3  | cracks for 라벤더 무광, 코튼 화이트            |
| wakppu/choco_crack_1.mp3, \_2.mp3   | cracks for 브라운 5겹, 퍼플 글리터             |
| wakppu/apple_knead_1.mp3, \_2.mp3   | pressing (knead) sound                         |
| wakppu/choco_knead_1.mp3, \_2.mp3   | pressing (knead) sound                         |

Integrity: each local file's git blob SHA-1 (`git hash-object <file>`) equals the blob SHA of the same path in the source repository at commit `6882beb`:

| File                | git blob SHA-1                           |
| ------------------- | ---------------------------------------- |
| apple_crack_1.mp3   | f17d8c57b5aa065ca764e8c748b9e5d74be318e3 |
| apple_crack_2.mp3   | 238160aa2c8c79da5d7c35df0dfb2222abf82319 |
| apple_knead_1.mp3   | e6b492e8a03056afaf23254caf97f5b557ab92d2 |
| apple_knead_2.mp3   | 98e887f50b4a5586d806acf23f53d1868f91ddb5 |
| balloon_crack_1.mp3 | 2f342131d5e3bd0e3c66bebeb9e94c1f53a00b1a |
| balloon_crack_2.mp3 | 0dfcfd2a639075fab6ef042f63cad738212137d4 |
| butter_crack_1.mp3  | ecbfe1877dcafaebf234cb2456c77fad3e0010da |
| butter_crack_2.mp3  | 4529f33e0ebfccfc3795087b129b326cb29bb0ce |
| choco_crack_1.mp3   | 9cadaa0e3f2928e29804d1d371eeaa43862e971e |
| choco_crack_2.mp3   | 8cf59d6c053e431734591dba5c6b64399dbb0013 |
| choco_knead_1.mp3   | 981a9dcfb4f89c134b644da96130a841de2f3ad8 |
| choco_knead_2.mp3   | 36fd99c36781acf8de23d0fdd68902d093407319 |

The author's notice (`audio/LICENSE.md`, same commit) reads: the 12 MP3 files are original recordings by apple77771, usable under CC BY 4.0 with the attribution "WAK-PPU-BALL sound effects by apple77771, licensed under CC BY 4.0."; the repository's source code is MIT and is not used here.

Only the audio files are used. The reference project's source code (MIT) was not copied; the playback approach (per-material crack/knead takes, cutting the previous knead before the next one) was reimplemented in `src/lib/minigame/waxAudio.ts`.

## Other sounds — Freesound (CC0 1.0)

Downloaded 2026-11-10 as the public preview MP3 of each sound and trimmed on MPEG frame boundaries without re-encoding. CC0 needs no attribution; it is listed for traceability.

| Local file             | Original                                        | Creator     | Source                                                  |
| ---------------------- | ----------------------------------------------- | ----------- | ------------------------------------------------------- |
| whack-1.mp3            | whack01.mp3                                     | Qat         | https://freesound.org/people/Qat/sounds/114682/         |
| whack-2.mp3            | whack02.mp3                                     | Qat         | https://freesound.org/people/Qat/sounds/114683/         |
| ambience-classroom.mp3 | Classroom Ambience - High School Class (2–24 s) | okieactor   | https://freesound.org/people/okieactor/sounds/417041/   |
| ambience-hallway.mp3   | High school hallway ambience.wav (10–32 s)      | SEF7        | https://freesound.org/people/SEF7/sounds/706989/        |
| chalk.mp3              | Chalk_Board_Writing_Classroom (2–14 s)          | DeanHopkins | https://freesound.org/people/DeanHopkins/sounds/266841/ |

License: https://creativecommons.org/publicdomain/zero/1.0/

## Removed stand-ins

Earlier builds used egg-shell, ice, candy and polystyrene recordings (Freesound CC0) and three Sonniss GDC 2015 files as stand-ins for wax cracks. They are no longer shipped or referenced.
