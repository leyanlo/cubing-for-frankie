# Rubik’s Cube for Frankie

Printable HTML version of the two-page handwritten Rubik’s Cube guide, rebuilt with typed text, local SVG cube diagrams, and screen-only AnimCubeJS algorithm players.

Open `index.html` in a browser and print at 100% scale on letter paper. The print stylesheet sets each page to exactly 8.5 x 11 inches.

The generated diagrams are in `diagrams/` and can be regenerated with:

```sh
node scripts/generate-diagrams.mjs
```

The algorithm player script is vendored at `vendor/AnimCube3.js`.

## Deploying

This repo is set up for GitHub Pages with GitHub Actions. On each push to `main`,
`.github/workflows/pages.yml` uploads the static site and deploys it to Pages.

Use `cubing-for-frankie.leyanlo.com` as the Pages custom domain. In DNS, create a
`CNAME` record:

```txt
cubing-for-frankie.leyanlo.com -> leyanlo.github.io
```

In the GitHub repo settings, set **Pages > Build and deployment > Source** to
**GitHub Actions**. After the first deploy, GitHub should read the root `CNAME`
file and attach the custom domain.
