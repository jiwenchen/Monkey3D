// wrap your task in an immediate function to avoid global namespace collisions with other tasks

(function () {
  let loadConfig;
  function loadTaskInitialize(config) {
    loadConfig = config;
    importScripts(config.Path[0]);
    importScripts(config.Path[1]);
  }

  function loadTaskHandler(data, doneCallback) {
    // we fake real processing by setting a timeout
    let { url, tags } = data.data;
    let realUrl = url
      .replace("viewerbm:", "")
      .replace("image-loader:", "")
      .replace("mask-loader:", "");
    const handler = function () {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        if (url.includes("bm")) {
          let headBuffer = this.response.slice(0, 128);
          let imageBuffer = this.response.slice(128, -1);
          let params = decodeHead(headBuffer);
          let imageData = decodeBm(imageBuffer, params, tags, url);
          doneCallback(imageData, [imageData.pixelArray.buffer]);
          this.response = null;
        } else if (url.includes("png")){
          const imageData = decompressPng(this.response, tags, url);
          doneCallback(imageData, [imageData.pixelArray.buffer]);
          this.response = null;
        } else {
          doneCallback(this.response);
        }
      } else {
        doneCallback(this.statusText);
      }
      client.onloadstart = null;
      client.onloadend = null;
      client.onreadystatechange = null;
      client.onprogress = null;
      client = null;
    };

    let client = new XMLHttpRequest();
    client.open("GET", realUrl);
    client.onreadystatechange = handler; //关键点
    if (!realUrl.includes("pkl")) {
      client.responseType = "arraybuffer";
    }
    client.send();
  }

  function getPixelValues(pixelData) {
    let minPixelValue = Number.MAX_VALUE;
    let maxPixelValue = Number.MIN_VALUE;
    let len = pixelData.length;
    let pixel = void 0;

    for (let i = 0; i < len; i++) {
      pixel = pixelData[i];
      minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
      maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
    }

    return {
      minPixelValue: minPixelValue,
      maxPixelValue: maxPixelValue
    };
  };
  // bm图解析
  function decodeHead(headBuffer) {
    let list = [
      String.fromCharCode.apply(null, new Uint8Array(headBuffer.slice(0, 2))),
    ];
    list = list.concat(...new Uint32Array(headBuffer.slice(4, 36)));
    list = list.concat(...new Float32Array(headBuffer.slice(36, 60)));
    /*

      enum PixelFormat
          // 已处理

          * {summary}{Graylevel, unsigned 16bpp image.}
          * {description}{The image is graylevel. Each pixel is unsigned and stored in two bytes.}
          PixelFormat_Grayscale16 = 4,

          * {summary}{Graylevel, signed 16bpp image.}
          * {description}{The image is graylevel. Each pixel is signed and stored in two bytes.}
          PixelFormat_SignedGrayscale16 = 5,

          * {summary}{Graylevel 8bpp image.}
          * {description}{The image is graylevel. Each pixel is unsigned and stored in one byte.}
          PixelFormat_Grayscale8 = 3,


          * {summary}{Color image in RGBA32 format.}
          * {description}{This format describes a color image. The pixels are stored in 4
          * consecutive bytes. The memory layout is RGBA.}
          PixelFormat_RGBA32 = 2,

          * {summary}{Graylevel, floating-point image.}
          * {description}{The image is graylevel. Each pixel is floating-point and stored in 4 bytes.}
          PixelFormat_Float32 = 6,

          // This is the memory layout for Cairo (for internal use in Stone of Orthanc)
          PixelFormat_BGRA32 = 7,

          * {summary}{Graylevel, unsigned 32bpp image.}
          * {description}{The image is graylevel. Each pixel is unsigned and stored in 4 bytes.}
          PixelFormat_Grayscale32 = 8,

          * {summary}{Graylevel, unsigned 64bpp image.}
          * {description}{The image is graylevel. Each pixel is unsigned and stored in 8 bytes.}
          PixelFormat_Grayscale64 = 10
  };
       */

    // ['BM', 800, 600, 4800, 3, 16, 0, 9, 0, 0, 1, 0, 0.3966499865055084, 0.3966499865055084]
    // ['BM', 1056, 594, 3168, 3, 8, 0, 1, 0, 0, 1, 0, 0, 0]
    let props = [
      "name", // 2            //
      "width", // 4           // 512
      "height", // 4          // 512
      "pitch", // 4          // 1024
      "sampleOfPixel", // 4   // 1     | 3
      "depth", // 4           // 16    | 8
      "signed", // 4          // 0 | 1 | 0
      "format", // 4          // 4 | 5 | 1 | 9
      "invert", // 4          // 4 | 5 | 1 | 9
      "window_center", // 4   // format Float32Array
      "window_width", // 4
      "rescale_slope", // 4
      "rescale_intercept", // 4
      "pixel_spacing_x", // 4
      "pixel_spacing_y", // 4
    ];

    let params = {};
    props.forEach((item, index) => {
      params[item] = list[index];
    });
    return params;
  }
  function convertPixel(targetPixel, pixelArray) {
    let index = 0;
    for (let i = 0; i < pixelArray.length; i += 3) {
      targetPixel[index++] = pixelArray[i];
      targetPixel[index++] = pixelArray[i + 1];
      targetPixel[index++] = pixelArray[i + 2];
      targetPixel[index++] = 255; // Alpha channel
    }
    return targetPixel;
  }
  function decodeBm(buffer, params, tags, imageId) {
    let {
      signed,
      depth,
      width,
      height,
      invert = 1,
      format,
      pixel_spacing_x = 1,
      pixel_spacing_y = 1,
      window_center,
      window_width,
      rescale_intercept = 0,
      rescale_slope = 1,
    } = params;
    let pixelArray = pako.inflate(buffer);
    let pixelBufferFormat;
    let isColor = false;
    // RGB24 format The pixels are stored in 3
    if (format === 3) {
      pixelBufferFormat = "Uint8";
    }else if (format === 1 ) {
      // * {summary}{Color image in RGB24 format.}
      // * {description}{This format describes a color image. The pixels are stored in 3 consecutive bytes. The memory layout is RGB.}
      // * PixelFormat_RGB24 = 1,
      let buf = new ArrayBuffer((pixelArray.length / 3) * 4); // RGB32
      let pixels;
      if (signed) {
        pixels = new Int8Array(buf);
        pixelBufferFormat = "Int8";
      } else {
        pixels = new Uint8Array(buf);
        pixelBufferFormat = "Uint8";
      }
      pixelArray = convertPixel(pixels, pixelArray);
      // RGB48 format
    } else if (format === 9) {
      // * {summary}{Color image in RGB48 format.}
      // * {description}{This format describes a color image. The pixels are stored in 6 bytes
      // * consecutive bytes. The memory layout is RGB.}
      // PixelFormat_RGB48 = 9,
      pixelBufferFormat = "Uint8";
      const number = pixelArray.length / 3 / tags.rows / tags.columns;
      const pixels = new Uint8Array((pixelArray.length / 3) * number * 4); // RGB24
      let index = 0;
      for (let i = 0; i < pixelArray.length; i += 3 * number) {
        pixels[index++] = pixelArray[i + 1];
        pixels[index++] = pixelArray[i + number + 1];
        pixels[index++] = pixelArray[i + 2 * number + 1];
        pixels[index++] = 255; // Alpha channel
      }
      pixelArray = pixels;
    } else {
      if (signed) {
        pixelArray = new Int16Array(pixelArray.buffer);
        pixelBufferFormat = "Int16";
      } else {
        if(depth === 32){
          pixelArray = new Uint32Array(pixelArray.buffer);
          pixelBufferFormat = "Uint32";
        }else{
          pixelArray = new Uint16Array(pixelArray.buffer);
          pixelBufferFormat = "Uint16";
        }
      }
    }
    if ([1, 2, 7, 9].includes(format)) {
      isColor = true;
    }

    let pixelValues = getPixelValues(pixelArray);
    let minPixelValue = pixelValues.minPixelValue;
    let maxPixelValue = pixelValues.maxPixelValue;
    if (!window_center || !window_width) {
      if (!isColor) {
        window_center = (maxPixelValue - minPixelValue) / 2 + minPixelValue;
        window_width = maxPixelValue - minPixelValue;
      } else {
        window_center = 128;
        window_width = 256;
      }
    }

    const id = imageId.split('?')[0];
    const instancePublicid = id.split('/')[id.split('/').length - 1]
    let cornerstoneMetaData = {
      imageId: id,
      instanceID: tags.sop_instance_uid+"_"+instancePublicid.split('_')[1],
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
      tags,
      pixelArray: pixelArray,
      pixelBufferFormat,
    };
    return cornerstoneMetaData;

  }
  //png图解析
  function isColorImage(photoMetricInterpretation) {
    if (
      photoMetricInterpretation === 'RGB' ||
      photoMetricInterpretation === 'PALETTE COLOR' ||
      photoMetricInterpretation === 'YBR_FULL' ||
      photoMetricInterpretation === 'YBR_FULL_422' ||
      photoMetricInterpretation === 'YBR_PARTIAL_422' ||
      photoMetricInterpretation === 'YBR_PARTIAL_420' ||
      photoMetricInterpretation === 'YBR_RCT' ||
      photoMetricInterpretation === 'YBR_ICT'
    ) {
      return true;
    } else {
      return false;
    }
  }
  function decompressPng(pngBinary, tags, imageId) {
    let data = new Uint8Array(pngBinary);
    let png;
    try {
      png = PNG.newPng(data);
      data = null
    } catch (e) {
      console.log(
        '%c loadHandlerManager > decompressPng error:',
        'color:#f00;font-size:18px;',
        'url: ',
        imageId,
      );
      console.log(e);
      return;
    }
    let pixelArray = png.decodePixels();
    const isSigned = !!+tags.pixel_representation;
    const bColor = isColorImage(tags.photometric_interpretation);
    if (!bColor) {
      if (tags.bits_stored !== 8) {
        let index = 0;
        let upper;
        let lower;
        const newPixelArray = new Uint16Array(pixelArray.length / 2);
        for (let i = 0; i < pixelArray.length; i += 2) {
          // PNG is little endian
          upper = pixelArray[i];
          lower = pixelArray[i + 1];
          newPixelArray[index] = lower + upper * 256;
          index++;
        }

        if (isSigned) {
          pixelArray = new Int16Array(newPixelArray.buffer);
        } else {
          pixelArray = newPixelArray;
        }
      }
    } else {
      // color
      if (tags.bits_stored === 16) {
        const number = pixelArray.length / 3 / tags.rows / tags.columns;
        const pixels = new Uint8Array((pixelArray.length / 3) * number * 4); // RGB24
        let index = 0;
        for (let i = 0; i < pixelArray.length; i += 3 * number) {
          pixels[index++] = pixelArray[i];
          pixels[index++] = pixelArray[i + number];
          pixels[index++] = pixelArray[i + 2 * number];
          pixels[index++] = 255; // Alpha channel
        }
        pixelArray = pixels;
      } else {
        // rgb
        const pixels = new Uint8Array((pixelArray.length / 3) * 4); // RGB24
        let index = 0;
        for (let i = 0; i < pixelArray.length; i += 3) {
          pixels[index++] = pixelArray[i];
          pixels[index++] = pixelArray[i + 1];
          pixels[index++] = pixelArray[i + 2];
          pixels[index++] = 255; // Alpha channel
        }
        pixelArray = pixels;
      }
    }

    const pixelValues = getPixelValues(pixelArray);
    const minPixelValue = pixelValues.minPixelValue;
    const maxPixelValue = pixelValues.maxPixelValue;

    let pixelSpacing = tags.pixel_spacing.split('\\');
    let columnPixelSpacing = 0;
    let rowPixelSpacing = 0;
    if (tags.pixel_spacing) {
      pixelSpacing = tags.pixel_spacing.split('\\');
      if (pixelSpacing.length === 2) {
        columnPixelSpacing = +pixelSpacing[1];
        rowPixelSpacing = +pixelSpacing[0];
      }
    } else if (tags.imager_pixel_spacing) {
      // at least used in XA studies
      pixelSpacing = tags.imager_pixel_spacing.split('\\');
      if (pixelSpacing.length === 2) {
        columnPixelSpacing = +pixelSpacing[1];
        rowPixelSpacing = +pixelSpacing[0];
      }
    }

    const id = imageId.split('?')[0];
    const cornerstoneMetaData = {
      imageId: id,
      instanceID: id.split('/')[id.split('/').length - 1],
      maxPixelValue: maxPixelValue,
      minPixelValue: minPixelValue,
      slope: +tags.rescale_slope || 1,
      intercept: +tags.rescale_intercept || 0,
      windowCenter: 128,
      windowWidth: 255,
      pixelArray: pixelArray,
      rows: png.height,
      columns: png.width,
      height: png.height,
      width: png.width,
      color:
        tags.photometric_interpretation !== 'MONOCHROME1' &&
        tags.photometric_interpretation !== 'MONOCHROME2',
      columnPixelSpacing: columnPixelSpacing,
      rowPixelSpacing: rowPixelSpacing,
      sizeInBytes: pixelArray.byteLength,
      // extra add by bio image
      invert: tags.photometric_interpretation === 'MONOCHROME1',
      isSigned: !!+tags.pixel_representation,
      originalWidth: tags.columns,
      originalHeight: tags.rows,
      tags,
    };
    if (tags.window_center && tags.window_width) {
      const windowCenters = tags.window_center.split('\\');
      const windowWidths = tags.window_width.split('\\');

      // Only take the first ww/wc available, ignore others (if there is any).
      cornerstoneMetaData.windowCenter = +windowCenters[0] || 128;
      cornerstoneMetaData.windowWidth = +windowWidths[0] || 256;
    } else {
      cornerstoneMetaData.windowCenter = (maxPixelValue - minPixelValue) / 2 + minPixelValue;
      cornerstoneMetaData.windowWidth = maxPixelValue - minPixelValue;
    }
    png = null;
    return cornerstoneMetaData;
  }

  // register ourselves to receive messages
  self.registerTaskHandler({
    taskType: "loadImageTask",
    handler: loadTaskHandler,
    initialize: loadTaskInitialize,
  });
})();
