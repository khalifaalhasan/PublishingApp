import { spawn } from "node:child_process";

const {
  TUNNEL_SSH_HOST,
  TUNNEL_SSH_PORT,
  TUNNEL_SSH_USER,
  TUNNEL_LOCAL_PORT,
  TUNNEL_REMOTE_PORT,
} = process.env;

const required = {
  TUNNEL_SSH_HOST,
  TUNNEL_SSH_USER,
  TUNNEL_LOCAL_PORT,
  TUNNEL_REMOTE_PORT,
};
for (const [key, value] of Object.entries(required)) {
  if (!value) {
    console.error(`[tunnel] missing env var: ${key} — cek .env kamu`);
    process.exit(1);
  }
}

function connect() {
  console.log(
    `[tunnel] connecting to ${TUNNEL_SSH_HOST}:${TUNNEL_SSH_PORT ?? 22}...`,
  );
  const ssh = spawn(
    "ssh",
    [
      "-N",
      "-p",
      TUNNEL_SSH_PORT ?? "22",
      "-o",
      "ServerAliveInterval=15",
      "-o",
      "ServerAliveCountMax=3",
      "-o",
      "ExitOnForwardFailure=yes",
      "-L",
      `${TUNNEL_LOCAL_PORT}:127.0.0.1:${TUNNEL_REMOTE_PORT}`,
      `${TUNNEL_SSH_USER}@${TUNNEL_SSH_HOST}`,
    ],
    { stdio: "inherit" },
  );

  ssh.on("exit", (code) => {
    console.log(`[tunnel] disconnected (code ${code}), retrying in 3s...`);
    setTimeout(connect, 5000);
  });
}

connect();
