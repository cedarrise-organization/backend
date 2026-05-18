import cloudinary from "../../configs/cloudinary.config.js";
import { CACHE_TTL, cacheGet, cacheSet } from "../../lib/cache.js";

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

  const results = await cloudinary.search
    .expression(`asset_folder:"Cedarrise Initiative/ASH"`)
    .sort_by("created_at", "desc") // most recent photos first
    .max_results(200)
    .execute();

  // same syntax as ..{return {..}}
  const ashPhotos = results.resources.map((file: any) => ({
    public_id: file.public_id,
    url: file.secure_url,
  }));

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

  const results = await cloudinary.search
    .expression(`asset_folder:"Cedarrise Initiative/TACOTS"`)
    .sort_by("created_at", "desc") // most recent photos first
    .max_results(200)
    .execute();

  // same syntax as ..{return {..}}
  const tacotsPhotos = results.resources.map((file: any) => ({
    public_id: file.public_id,
    url: file.secure_url,
  }));

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

  const results = await cloudinary.search
    .expression(`asset_folder:"Cedarrise Initiative/OUTREACHES"`)
    .sort_by("created_at", "desc") // most recent photos first
    .max_results(200)
    .execute();

  // same syntax as ..{return {..}}
  const outreachPhotos = results.resources.map((file: any) => ({
    public_id: file.public_id,
    url: file.secure_url,
  }));

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

  const results = await cloudinary.search
    .expression(`asset_folder:"Cedarrise Initiative/CAPACITY BUILDING"`)
    .sort_by("created_at", "desc") // most recent photos first
    .max_results(200)
    .execute();

  // same syntax as ..{return {..}}
  const capacityPhotos = results.resources.map((file: any) => ({
    public_id: file.public_id,
    url: file.secure_url,
  }));

  // cache set
  await cacheSet(key, capacityPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "CAPACITY BUILDING photo urls found successfully",
    data: capacityPhotos,
  };
};
