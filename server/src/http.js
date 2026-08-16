// Route adapter for Express 4, which does not forward rejected async handlers.
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}
