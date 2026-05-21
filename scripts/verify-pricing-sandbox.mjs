import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = join(rootDir, "artifacts");
const port = Number(process.env.VERIFY_PORT || 3010);
const host = "127.0.0.1";
const pageUrl = `http://${host}:${port}/#pricing`;
const serverCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const serverArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npm.cmd", "run", "dev", "--", "-p", String(port), "-H", host]
    : ["run", "dev", "--", "-p", String(port), "-H", host];

const requiredTexts = [
  "Välj hur du vill använda Finansanalytik",
  "Gratisrapport",
  "Dagsrapport",
  "Månadsaccess",
  "Halvårsaccess",
  "Företag",
  "1 199 kr",
  "249 kr/mån",
  "49 kr",
  "moms ingår",
  "Mest värde",
  "Spara cirka 20%",
  "Jämför alternativen",
  "Är detta investeringsrådgivning?",
];

const forbiddenTexts = [
  /\bFree\b/,
  /\bDay Pass\b/,
  /\bMonthly Access\b/,
  /\bTeam\b/,
];

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function fetchWithTimeout(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForServer(url) {
  const deadline = Date.now() + 60000;
  let lastError = "";

  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await sleep(1000);
  }

  throw new Error(`Next sandbox did not become ready: ${lastError}`);
}

async function killTree(child) {
  if (!child.pid) {
    return;
  }

  const closePromise =
    child.exitCode === null
      ? new Promise((resolveClose) => {
          child.once("close", resolveClose);
        })
      : Promise.resolve();

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else if (child.exitCode === null) {
    child.kill("SIGTERM");
  }

  child.stdout?.destroy();
  child.stderr?.destroy();
  child.unref();

  await Promise.race([closePromise, sleep(5000)]);
}

function findEdgeExecutable() {
  if (process.env.EDGE_PATH && existsSync(process.env.EDGE_PATH)) {
    return process.env.EDGE_PATH;
  }
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((candidate) => existsSync(candidate)) || "";
}

function sandboxEnv(extra = {}) {
  const env = {
    ...process.env,
    ...extra,
  };
  if (process.platform === "win32") {
    const pathValue = env.Path || env.PATH || env.path || "";
    delete env.PATH;
    delete env.path;
    env.Path = pathValue;
  }
  return env;
}

function verifyPricingHtml(html) {
  const missing = requiredTexts.filter((text) => !html.includes(text));
  const forbidden = forbiddenTexts
    .filter((pattern) => pattern.test(html))
    .map((pattern) => pattern.source);

  if (missing.length || forbidden.length) {
    throw new Error(
      JSON.stringify(
        {
          missing,
          forbidden,
        },
        null,
        2,
      ),
    );
  }
}

function runEdgeCheck(edgePath) {
  if (!edgePath) {
    return {
      status: "skipped",
      reason: "Edge/Chrome executable not found",
    };
  }

  const profileDir = join(artifactsDir, `edge-profile-${Date.now()}`);
  const commonArgs = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-proxy-server",
    "--proxy-server=direct://",
    "--proxy-bypass-list=*",
    "--window-size=1440,1400",
    `--user-data-dir=${profileDir}`,
  ];

  const dom = spawnSync(edgePath, [...commonArgs, "--dump-dom", pageUrl], {
    cwd: rootDir,
    env: sandboxEnv(),
    encoding: "utf8",
    timeout: 45000,
  });
  const domOutput = `${dom.stdout || ""}\n${dom.stderr || ""}`;
  const canReadPricing = dom.status === 0 && domOutput.includes("Halvårsaccess");

  if (!canReadPricing) {
    rmSync(profileDir, { recursive: true, force: true });
    return {
      status: "warning",
      reason: "Browser opened, but pricing text was not visible in DOM dump",
      exitCode: dom.status,
    };
  }

  const screenshotPath = join(artifactsDir, "pricing-sandbox.png");
  const screenshot = spawnSync(
    edgePath,
    [
      ...commonArgs,
      "--hide-scrollbars",
      "--virtual-time-budget=8000",
      `--screenshot=${screenshotPath}`,
      pageUrl,
    ],
    {
      cwd: rootDir,
      env: sandboxEnv(),
      encoding: "utf8",
      timeout: 45000,
    },
  );
  rmSync(profileDir, { recursive: true, force: true });

  const hasScreenshot = screenshot.status === 0 && existsSync(screenshotPath);
  const screenshotBytes = hasScreenshot ? statSync(screenshotPath).size : 0;

  return {
    status: hasScreenshot && screenshotBytes >= 20000 ? "ok" : "warning",
    screenshotPath,
    screenshotBytes,
    exitCode: screenshot.status,
  };
}

mkdirSync(artifactsDir, { recursive: true });

const server = spawn(serverCommand, serverArgs, {
  cwd: rootDir,
  env: sandboxEnv({
    NEXT_TELEMETRY_DISABLED: "1",
  }),
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
server.stdout.on("data", (chunk) => {
  serverLog += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverLog += chunk.toString();
});

try {
  await waitForServer(pageUrl);
  const response = await fetchWithTimeout(pageUrl, 20000);
  const html = await response.text();
  verifyPricingHtml(html);

  const htmlPath = join(artifactsDir, "pricing-sandbox.html");
  writeFileSync(htmlPath, html, "utf8");

  const edgeResult = runEdgeCheck(findEdgeExecutable());
  const result = {
    status: "ok",
    url: pageUrl,
    htmlPath,
    requiredTexts: requiredTexts.length,
    edge: edgeResult,
  };
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  writeFileSync(join(artifactsDir, "pricing-sandbox-server.log"), serverLog, "utf8");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await killTree(server);
}
