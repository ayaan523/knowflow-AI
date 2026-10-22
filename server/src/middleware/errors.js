export function notFound(req, res) {
  res.status(404).json({ error: { message: "Route not found" } });
}
export function errorHandler(error, req, res, next) {
  void next;
  if (error.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ error: { message: "File is too large" } });
  console.error(error.message);
  res.status(error.status || 500).json({
    error: { message: error.status ? error.message : "Something went wrong" },
  });
}
