const fs = require("fs");
const path = require("path");

const srcDir = "d:\\code\\garments\\srp_germents_admin\\src\\components";
const destDir = "d:\\Rashed\\expense\\frontend\\src\\components";

if (!fs.existsSync(path.join(destDir, "ui")))
  fs.mkdirSync(path.join(destDir, "ui"), { recursive: true });
if (!fs.existsSync(path.join(destDir, "custom")))
  fs.mkdirSync(path.join(destDir, "custom"), { recursive: true });

const filesToCopy = [
  {
    src: path.join(srcDir, "ui", "select.tsx"),
    dest: path.join(destDir, "ui", "select.tsx"),
  },
  {
    src: path.join(srcDir, "custom", "form-select.tsx"),
    dest: path.join(destDir, "custom", "form-select.tsx"),
  },
  {
    src: path.join(srcDir, "custom", "phone-input.tsx"),
    dest: path.join(destDir, "custom", "phone-input.tsx"),
  },
  {
    src: path.join(srcDir, "custom", "phone-input.impl.tsx"),
    dest: path.join(destDir, "custom", "phone-input.impl.tsx"),
  },
];

filesToCopy.forEach((file) => {
  fs.copyFileSync(file.src, file.dest);
  console.log(`Copied ${file.src} to ${file.dest}`);
});
