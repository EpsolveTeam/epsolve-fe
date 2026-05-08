export default async function handler(req, res) {
  const baseURL = process.env.BACKEND_URL;
  const path = req.query.path ? req.query.path.join("/") : "";

  const url = `${baseURL}/${path}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}