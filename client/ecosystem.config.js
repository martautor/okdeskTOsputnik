module.exports = {
  apps : [{
    name: "client",
    script: 'npx',
    watch: false,
    interpreter: "none",
    args: "serve -p 3000 -T"
  }],
};
