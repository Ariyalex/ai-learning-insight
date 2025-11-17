exports.success = (res, { status = 200, message = "Success", data = null }) => {
  return res.status(status).json({
    success: true,
    status,
    message,
    ...(data && { data }),
  });
};

exports.error = (
  res,
  { status = 500, message = "Server error", data = null }
) => {
  return res.status(status).json({
    success: false,
    status,
    message,
    ...(data && { data }),
  });
};
