import { copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = ".output/public";

copyFileSync(join(outDir, "index.html"), join(outDir, "404.html"));
writeFileSync(join(outDir, ".nojekyll"), "");

console.log("GitHub Pages: created 404.html and .nojekyll in .output/public");
