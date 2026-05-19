import cloudinary from "../../configs/cloudinary.config.js";
import { CACHE_TTL, cacheGet, cacheSet } from "../../lib/cache.js";
import { searchCloudinary } from "../../utils/storage.util.js";

export const ashCarousel = async () => {
  /// cache
  const key = `cedarrise:gallery:ash`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "ASH photo urls found successfully",
      data: cacheRes,
    };
  }
  ///

  const ashPhotos = await searchCloudinary(`asset_folder:"Cedarrise Initiative/ASH"`, 200);

  // cache set
  await cacheSet(key, ashPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "ASH photo urls found successfully",
    data: ashPhotos,
  };
};

export const tacotsCarousel = async () => {
  /// cache
  const key = `cedarrise:gallery:tacots`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "TACOTS photo urls found successfully",
      data: cacheRes,
    };
  }
  ///

  const tacotsPhotos = await searchCloudinary(`asset_folder:"Cedarrise Initiative/TACOTS"`, 200);

  // cache set
  await cacheSet(key, tacotsPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "TACOTS photo urls found successfully",
    data: tacotsPhotos,
  };
};

export const outreachCarousel = async () => {
  /// cache
  const key = `cedarrise:gallery:outreaches`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "OUTREACHES photo urls found successfully",
      data: cacheRes,
    };
  }
  ///

  const outreachPhotos = await searchCloudinary(
    `asset_folder:"Cedarrise Initiative/OUTREACHES"`,
    200,
  );

  // cache set
  await cacheSet(key, outreachPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "OUTREACHES photo urls found successfully",
    data: outreachPhotos,
  };
};

export const capacityCarousel = async () => {
  /// cache
  const key = `cedarrise:gallery:capacity`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "CAPACITY BUILDING photo urls found successfully",
      data: cacheRes,
    };
  }
  ///

  const capacityPhotos = await searchCloudinary(
    `asset_folder:"Cedarrise Initiative/CAPACITY BUILDING"`,
    200,
  );

  // cache set
  await cacheSet(key, capacityPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "CAPACITY BUILDING photo urls found successfully",
    data: capacityPhotos,
  };
};
