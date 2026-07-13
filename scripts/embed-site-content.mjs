import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataFile = path.join(root, "data", "site-content.json");
const targets = [
  path.join(root, "preview.html"),
  path.join(root, "public", "preview.html")
];

const content = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const escapedJson = JSON.stringify(content).replace(/</g, "\\u003c");
const block = `<script type="application/json" id="initialSiteContent">${escapedJson}</script>`;
const existingBlock = /[ \t]*<script type="application\/json" id="initialSiteContent">[\s\S]*?<\/script>\n?/;

for (const target of targets) {
  let html = fs.readFileSync(target, "utf8");
  if (existingBlock.test(html)) {
    html = html.replace(existingBlock, `    ${block}\n`);
  } else {
    html = html.replace("    <script>\n", `    ${block}\n    <script>\n`);
  }
  fs.writeFileSync(target, html);
  console.log(`Embedded site content into ${path.relative(root, target)}`);
}
