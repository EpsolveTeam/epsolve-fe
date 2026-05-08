export default async function handler(req, res) {
  try {
    const baseURL = process.env.BACKEND_URL;

    const rawPath = req.query.path;

    const path = Array.isArray(rawPath)
      ? rawPath.join("/")
      : rawPath || "";

    const url = `${baseURL}/${path}`;

    console.log("TARGET:", url);

    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log("STATUS:", response.status);

    res.status(response.status).send(text);

  } catch (err) {
    console.error("FULL ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
}