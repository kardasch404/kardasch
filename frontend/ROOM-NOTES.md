# Interactive portfolio study

The home page uses a Three.js study on desktop, with a readable document view on phones and when WebGL is unavailable. The document view remains selectable on desktop; phones can opt into 3D.

## Controls and content

- Select an object on the canvas or in the object menu. Drag, pick up, rotate, read, and put it back. Keyboard buttons offer the same actions. Object placement is saved locally; Reset objects restores the original layout.
- Right-drag to orbit, scroll to zoom, and use the office chair's Sit down action for the computer view.
- The lamp changes scene lighting and shadows. Computer power controls both the screen and the terminal. The terminal accepts portfolio commands, not shell commands.
- The chess table opens a local two-player game with legal move validation, promotion, castling, en passant, checkmate, and a clock per player. Closing the document pauses the clock. The game remains in memory until page reload; there is no online opponent or AI.
- Morocco map pins open city-specific education and event connections. Casablanca and Youssoufia come from the portfolio data. Projects without a documented location remain unassigned.

`src/data/general.json` is now the canonical content source. It includes the owner profile, education, experience, certifications, skills, eight projects, seven presentations, two event/session records, location configuration, and a ten-image media library. Legacy `getData` calls for profile/projects/education also read this file; the talks page consumes its presentation and event records. Older JSON files remain preserved but no longer drive those pages.

Original photographs remain in `src/data/imgs/`. `scripts/sync-room-photos.cjs` creates optimized copies in `public/photos/` before development and production builds. Each record has `media.coverId`, `media.images` (id, src, alt, caption) and `media.videos`. Update these fields to add an album or video; `links.canva`, `links.slides`, `links.repository` and `links.other` populate document actions only when provided. The physical documents and the computer open the same records.

Only Youssoufia and Casablanca have Morocco pins. The owner confirmed that all seven presentations took place in Youssoufia. Events without a confirmed city retain `locationId: null` and remain visible under All places. Germany is explicitly a future relocation goal, shown by a pencil circle and red thread from Casablanca. Its coordinate is a country-level illustration, not a selected destination city. The new hackathon record preserves November 7 with an unknown year; it takes priority over the conflicting older talks record.

## Assets and sources

`public/room/morocco-map.webp` is a locally cached OpenStreetMap viewport, composed from nine tiles by `scripts/build-room-map.cjs`. Preserve the visible OpenStreetMap credit and link when reusing the map. Sources: [OpenStreetMap copyright](https://www.openstreetmap.org/copyright), [tile usage policy](https://operations.osmfoundation.org/policies/tiles/), [Casablanca coordinates](https://wiki.openstreetmap.org/wiki/Casablanca), [Youssoufia coordinates](https://www.getty.edu/vow/TGNFullDisplay?english=N&find=7014494&nation=&place=&subjectid=1091466).

The active journey map is `public/room/vintage-atlas.webp`, built with `node scripts/build-vintage-atlas.cjs`. It combines public-domain [Natural Earth country geometry](https://www.naturalearthdata.com/about/terms-of-use/) from `src/data/maps/natural-earth-countries.geojson` with aged paper. Bounds live in `general.json` under `map.viewport`; both 3D and HTML maps use the same Mercator projection. Old OpenStreetMap assets remain preserved but are not displayed.

The large board dimensions and ten photo placements live under `general.json` / `board`. All photographs retain their full original aspect ratio, without frames or cropping. Separate subject cards open the related presentation/event records. All eight projects sit along the bottom. Photo-to-topic threads attach to real pins and follow objects when moved. Focus board and View room provide two camera views.

`public/room/atlas-paper.webp` was created with the built-in image generation tool, then optimized with Sharp. Exact prompt: "Create a photorealistic texture asset: one single old folded atlas sheet, photographed perfectly straight-on from above, filling the entire landscape 3:2 frame edge to edge. Blank aged tan and ochre rag paper, believable fine paper fibers, subtle foxing and darkened irregular worn edges, three vertical fold creases and one horizontal fold, softly buckled areas catching warm light, restrained stains. The center must remain medium pale warm brown and very legible for dark ink cartography that will be overlaid in code. No map, no geography, no writing, no letters, no symbols, no illustrations, no props, no frame, no dramatic cast shadow, no white border. Detailed physical paper, restrained vintage detective archive atmosphere. Output only the paper texture." The cartographic outlines are rendered from geographic data, not generated by AI.

`scripts/verify-general.cjs` verifies media files, board contents, journal albums, geographic filters, future-goal visibility, project links, and shared computer/room content.

`public/room/detective-study.webp` is an AI-generated image used by the document-view backdrop, created with the built-in image generation tool and optimized to WebP. Generation prompt brief: Photorealistic landscape vintage detective study, straight-on view, large empty cork board framed in wood across the upper center, walnut desk in the foreground, vintage CRT computer on the left, brass architect lamp on the right, warm light pooling across the board and papers, dark olive walls, convincing wood and cork textures, cinematic shadows, no text or watermark. The interactive 3D room is built from separate geometry; the backdrop is not a photograph of the user's room.

The existing project illustrations are retained in `public/room/projects/`. Chess rules use [chess.js](https://jhlywa.github.io/chess.js/); piece models are local procedural geometry.

## Local development and verification

Run `npm run dev` in `frontend`. The dev and production scripts use Webpack. This avoids the runaway Turbopack/PostCSS worker issue observed in this Windows checkout. Production output is a static export in `out/`; serve that directory with a static web server.

Run `npm run lint`, `npx tsc --noEmit --incremental false`, and `npm run build`. `scripts/verify-study.cjs` runs browser interaction checks against localhost:3000 (override with `ROOM_URL`). It uses Playwright; set `PLAYWRIGHT_MODULE_PATH` to an existing installation if Playwright is not installed in this project. Screenshots, a printable CV, and results are written to `../output/room-review/`.

Room objects use procedural materials and rounded geometry. They remain a stylized 3D scene rather than scanned photorealistic furniture. Rendering pauses behind open documents, caches shadows until objects move, and avoids continuous redraws of an unchanged chessboard.
