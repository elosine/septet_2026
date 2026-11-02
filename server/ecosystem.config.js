// PM2 process file for the box (DESIGN §9; AR-72, was AR-55). `pm2 start server/ecosystem.config.js`
// One running server per piece (D102): this one is `ss-server` (Scattered Substance,
// the Tempus septet; ported from piece #4, 9t), beside `sq1-server` and `bcb-server`.
module.exports = {
  apps: [{
    name: 'ss-server',
    script: 'server/server.js',
    cwd: __dirname + '/..',
    // TRUST_PROXY: behind nginx, read the real address and scheme from the
    // forwarded headers (the rate limiter, the printed links). The admin key is
    // generated into server/data/admin.key on first start.
    env: { NODE_ENV: 'production', PORT: 5301, TRUST_PROXY: '1' },
    max_memory_restart: '300M',
    autorestart: true,
    restart_delay: 1000,
  }],
};
