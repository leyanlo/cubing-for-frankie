# Cubing for Frankie

Printable HTML version of the two-page handwritten Rubik’s Cube guide, rebuilt with typed text, local SVG cube diagrams, and screen-only AnimCubeJS algorithm players.

Open `index.html` in a browser and print at 100% scale on letter paper. The print stylesheet sets each page to exactly 8.5 x 11 inches.

The generated diagrams are in `diagrams/` and can be regenerated with:

```sh
node scripts/generate-diagrams.mjs
```

The algorithm player script is vendored at `vendor/AnimCube3.js`.
