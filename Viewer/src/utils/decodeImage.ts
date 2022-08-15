import cornerstone from 'cornerstone-core';
import { PNG } from 'local-png-js';
export const decodeVR = (img_b64: string, imgId: string) => {
  const base64Buffer = _loadBase64(img_b64, false);
  const png = PNG.newPng(base64Buffer);
  let pixelArray = png.decodePixels();
  const isColor = true;
  const width = png.width;
  const height = png.height;
  let window_center = 128;
  let window_width = 256;
  const pixel_spacing_x = 1;
  const pixel_spacing_y = 1;

  const rescale_intercept = 0;
  const rescale_slope = 1;
  const invert = false;
  const signed = false;

  const buf = (pixelArray.length / 3) * 4; // RGB32
  let pixels;
  if (signed) {
    pixels = new Int8Array(buf);
  } else {
    pixels = new Uint8Array(buf);
  }
  pixelArray = _convertPixel(pixels, pixelArray);

  const pixelValues = _getPixelValues(pixelArray);
  const minPixelValue = pixelValues.minPixelValue;
  const maxPixelValue = pixelValues.maxPixelValue;
  if (!window_center || !window_width) {
    if (!isColor) {
      window_center = (maxPixelValue - minPixelValue) / 2 + minPixelValue;
      window_width = maxPixelValue - minPixelValue;
    } else {
      window_center = 128;
      window_width = 256;
    }
  }

  const cornerstoneMetaData = {
    imageId: `colorImage://${imgId}`,
    color: isColor,
    columnPixelSpacing: pixel_spacing_y,
    rowPixelSpacing: pixel_spacing_x,
    columns: width,
    rows: height,
    originalWidth: width,
    originalHeight: height,
    width,
    height,
    intercept: rescale_intercept,
    invert: !!invert,
    isSigned: !!signed,
    maxPixelValue: maxPixelValue,
    minPixelValue: minPixelValue,
    sizeInBytes: pixelArray.byteLength,
    slope: rescale_slope,
    windowCenter: window_center,
    windowWidth: window_width,
    getPixelData: () => pixelArray,
    render: cornerstone.renderColorImage,
  };
  return cornerstoneMetaData;
};

export const decodeMPR = (img_b64: string, imgId: string) => {
  const base64Buffer = _loadBase64(img_b64, false);
  const png = new PNG(base64Buffer);
  let pixelArray = png.decodePixels();
  const width = png.width * 2;
  const height = png.height;

  const isColor = false;
  let window_center = 40;
  let window_width = 400;
  const pixel_spacing_x = 1;
  const pixel_spacing_y = 1;

  const rescale_intercept = 0;
  const rescale_slope = 1;
  const invert = false;
  const signed = true;

  pixelArray = new Int16Array(pixelArray.buffer);

  const pixelValues = _getPixelValues(pixelArray);
  const minPixelValue = pixelValues.minPixelValue;
  const maxPixelValue = pixelValues.maxPixelValue;
  if (!window_center || !window_width) {
    if (!isColor) {
      window_center = (maxPixelValue - minPixelValue) / 2 + minPixelValue;
      window_width = maxPixelValue - minPixelValue;
    } else {
      window_center = 128;
      window_width = 256;
    }
  }

  const cornerstoneMetaData = {
    imageId: `greyImage://${imgId}`,
    color: isColor,
    columnPixelSpacing: pixel_spacing_y,
    rowPixelSpacing: pixel_spacing_x,
    columns: width,
    rows: height,
    originalWidth: width,
    originalHeight: height,
    width,
    height,
    intercept: rescale_intercept,
    invert: !!invert,
    isSigned: !!signed,
    maxPixelValue: maxPixelValue,
    minPixelValue: minPixelValue,
    sizeInBytes: pixelArray.byteLength,
    slope: rescale_slope,
    windowCenter: window_center,
    windowWidth: window_width,
    getPixelData: () => pixelArray,
    render: cornerstone.renderGrayscaleImage,
  };
  return cornerstoneMetaData;
};

function _loadBase64(base64Str: string, isBuffer = true) {
  const binary_string = window.atob(base64Str);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }

  return isBuffer ? bytes.buffer : bytes;
}

function _convertPixel(targetPixel: Uint8Array | Int8Array | number[], pixelArray: string | any[]) {
  let index = 0;
  for (let i = 0; i < pixelArray.length; i += 3) {
    targetPixel[index++] = pixelArray[i];
    targetPixel[index++] = pixelArray[i + 1];
    targetPixel[index++] = pixelArray[i + 2];
    targetPixel[index++] = 255; // Alpha channel
  }
  return targetPixel;
}

function _getPixelValues(pixelData: string | any[]) {
  let minPixelValue = Number.MAX_VALUE;
  let maxPixelValue = Number.MIN_VALUE;
  const len = pixelData.length;
  let pixel;

  for (let i = 0; i < len; i++) {
    pixel = pixelData[i];
    minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
    maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
  }

  return {
    minPixelValue: minPixelValue,
    maxPixelValue: maxPixelValue,
  };
}
