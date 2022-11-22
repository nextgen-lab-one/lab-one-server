const cloudinary = require("cloudinary");
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const cloudUpload = async (image) => {
  const result = await cloudinary.v2.uploader.upload(image.url, {
    public_id: image.id,
  });
  return result;
};

module.exports = cloudUpload;
