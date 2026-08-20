const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "automated-cloud-deployment-app",
      }),
    );
    return;
  }

  if (req.url === "/") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        message:
          "🚀 Automated Cloud Deployment Pipeline Running Successfully on AWS!",
        status: "healthy",
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  res.writeHead(404);
  res.end(
    JSON.stringify({
      error: "Route not found",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
