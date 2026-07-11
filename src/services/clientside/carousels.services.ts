import { CACHE_TTL, cacheGet, cacheSet } from "../../lib/cache.js";
import { searchCloudinary } from "../../utils/storage.util.js";

export const ashCarousel = async (max: number, correlationId: string) => {
  /// cache
  const key = `cedarrise:gallery:ash:${max}`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "ASH photo urls found successfully",
      data: cacheRes,
      meta: {
        numberOfPhotos: max,
        correlationId
      },
    };
  }
  ///

  const ashPhotos = await searchCloudinary(`asset_folder:"Cedarrise Initiative/ASH"`, max);

  // cache set
  await cacheSet(key, ashPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "ASH photo urls found successfully",
    data: ashPhotos,
    meta: {
      numberOfPhotos: max,
      correlationId
    },
  };
};

export const tacotsCarousel = async (max: number, correlationId: string) => {
  /// cache
  const key = `cedarrise:gallery:tacots:${max}`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "TACOTS photo urls found successfully",
      data: cacheRes,
      meta: {
        numberOfPhotos: max,
        correlationId
      },
    };
  }
  ///

  const tacotsPhotos = await searchCloudinary(`asset_folder:"Cedarrise Initiative/TACOTS"`, max);

  // cache set
  await cacheSet(key, tacotsPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "TACOTS photo urls found successfully",
    data: tacotsPhotos,
    meta: {
      numberOfPhotos: max,
      correlationId
    },
  };
};

export const outreachCarousel = async (max: number, correlationId: string) => {
  /// cache
  const key = `cedarrise:gallery:outreaches:${max}`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "OUTREACHES photo urls found successfully",
      data: cacheRes,
      meta: {
        numberOfPhotos: max,
        correlationId
      },
    };
  }
  ///

  const outreachPhotos = await searchCloudinary(
    `asset_folder:"Cedarrise Initiative/OUTREACHES"`,
    max,
  );

  // cache set
  await cacheSet(key, outreachPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "OUTREACHES photo urls found successfully",
    data: outreachPhotos,
    meta: {
      numberOfPhotos: max,
      correlationId
    },
  };
};

export const capacityCarousel = async (max: number, correlationId: string) => {
  /// cache
  const key = `cedarrise:gallery:capacity:${max}`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "CAPACITY BUILDING photo urls found successfully",
      data: cacheRes,
      meta: {
        numberOfPhotos: max,
        correlationId
      },
    };
  }
  ///

  const capacityPhotos = await searchCloudinary(
    `asset_folder:"Cedarrise Initiative/CAPACITY BUILDING"`,
    max,
  );

  // cache set
  await cacheSet(key, capacityPhotos, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "CAPACITY BUILDING photo urls found successfully",
    data: capacityPhotos,
    meta: {
      numberOfPhotos: max,
      correlationId
    },
  };
};
