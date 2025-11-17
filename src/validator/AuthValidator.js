const Joi = require("joi");

const loginPayloadSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
    "string.email": "Email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password tidak boleh kosong",
    "any.required": "Password wajib diisi",
  }),
});

const refreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Access token tidak boleh kosong",
    "any.required": "Access token wajib diisi",
  }),
});

const logoutPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token tidak boleh kosong",
    "any.required": "Refresh token wajib diisi",
  }),
});

module.exports = {
  loginPayloadSchema,
  refreshTokenPayloadSchema,
  logoutPayloadSchema,
};
