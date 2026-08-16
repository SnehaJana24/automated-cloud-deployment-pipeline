const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "🚀 DevOps Capstone Project Running Successfully on AWS!",
      timestamp: new Date().toISOString(),
      status: "Healthy",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
