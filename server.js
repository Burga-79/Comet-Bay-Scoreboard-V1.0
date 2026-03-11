const fs = require("fs");
const path = require("path");
const multer = require("multer");
const express = require("express");
const app = express();

fs.writeFileSync("C:\\server-started.txt", "server.js reached top of file\n");
console.log("SERVER: Starting server.js");

const isDev = !app.isPackaged && process.resourcesPath === process.cwd();

const baseDir = isDev
  ? __dirname
  : path.join(process.resourcesPath, "app.asar.unpacked");

console.log("SERVER: isDev =", isDev);
console.log("SERVER: baseDir =", baseDir);

const imagesRoot = isDev
  ? path.join(__dirname, "images")
  : path.join(process.resourcesPath, "images");

const logoDir = path.join(imagesRoot, "logo");
const sponsorDir = path.join(imagesRoot, "sponsors");
const backgroundDir = path.join(imagesRoot, "backgrounds");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(imagesRoot);
ensureDir(logoDir);
ensureDir(sponsorDir);
ensureDir(backgroundDir);

const dataDir = isDev
  ? path.join(__dirname, "data")
  : path.join(process.resourcesPath, "data");

ensureDir(dataDir);

const teamsFile = path.join(dataDir, "teams.json");
const resultsFile = path.join(dataDir, "results.json");

app.get("/data/teams", (req, res) => {
  if (!fs.existsSync(teamsFile)) fs.writeFileSync(teamsFile, "[]");
  res.sendFile(teamsFile);
});

app.post("/data/teams", express.json(), (req, res) => {
  fs.writeFileSync(teamsFile, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.get("/data/results", (req, res) => {
  if (!fs.existsSync(resultsFile)) fs.writeFileSync(resultsFile, "[]");
  res.sendFile(resultsFile);
});

app.post("/data/results", express.json(), (req, res) => {
  fs.writeFileSync(resultsFile, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.use("/images", express.static(imagesRoot));

function makeStorage(targetDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const safe = base.replace(/[^a-z0-9_\-]/gi, "_");
      cb(null, `${safe}_${Date.now()}${ext}`);
    }
  });
}

const uploadLogo = multer({ storage: makeStorage(logoDir) });
const uploadSponsor = multer({ storage: makeStorage(sponsorDir) });
const uploadBackground = multer({ storage: makeStorage(backgroundDir) });

app.post("/upload/logo", uploadLogo.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, url: `/images/logo/${req.file.filename}` });
});

app.post("/upload/sponsor", uploadSponsor.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, url: `/images/sponsors/${req.file.filename}` });
});

app.post("/upload/background", uploadBackground.single("file"), (req, res) => {
  res.json({ filename: req.file.filename, url: `/images/backgrounds/${req.file.filename}` });
});

app.listen(3000, () => console.log("SERVER: Listening on port 3000"));
