// PM2: hält das Overlay am Laufen und startet es nach einem Reboot neu.
//   pm2 start deploy/ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: "soulstealer-overlay",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "400M",
    },
  ],
}
