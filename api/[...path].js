export default async function handler(req, res) {
  const baseURL = process.env.BACKEND_URL;

  const path = req.query.path
    ? req.query.path.join("/")
    : "";

  const url = `${baseURL}/${path}`;

  console.log("TARGET URL:", url);

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers["content-type"] || "application/json",
        Authorization: req.headers.authorization || "",
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log("STATUS:", response.status);
    console.log("BODY:", text);

    res.status(response.status).send(text);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}