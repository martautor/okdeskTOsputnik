module.exports = {
  apps : [
        {
        name   : "server",
        script : "./app.js",
        watch  : false,
        env: {
          NODE_ENV: "production"
        }
      },
  ]
}
