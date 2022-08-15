import cornerstone from 'cornerstone-core';
import $ from 'jquery';
import * as cornerstoneMath from 'cornerstone-math';

export const Cornerstone_EVENTS_NEWIMAGE = cornerstone.EVENTS.NEW_IMAGE;

export const enableElement = (element: HTMLElement | any) => {
  try {
    cornerstone.enable(element);
  } catch (error) {}
};

export const updateImage = (element: HTMLElement | any) => {
  cornerstone.updateImage(element);
};

export const updateAllImage = () => {
  $('.vessel-cornerstone-image').each((i: number, element: HTMLElement) => {
    try {
      updateImage(element);
    } catch (error) {}
  });
};

export const resizeAllImage = () => {
  $('.vessel-cornerstone-image').each((i: number, element: HTMLElement) => {
    try {
      cornerstone.resize(element, true);
    } catch (error) {}
  });
};

export const invertImage = (element: HTMLElement | any) => {
  const vp = cornerstone.getViewport(element);
  if (vp) {
    vp.invert = !vp.invert;
    cornerstone.setViewport(element, vp);
  }
};

export const addMetaProvider = (instanceTag: any) => {
  function returnMetaDataProvider(tags: any) {
    if (
      !tags.rows ||
      !tags.columns ||
      !tags.image_orientation_patient ||
      !tags.image_position_patient ||
      !tags.pixel_spacing
    ) {
      return undefined;
    }
    const imageOrientation = tags.image_orientation_patient.split('\\');
    const imagePosition = tags.image_position_patient.split('\\');
    const pixelSpacing = tags.pixel_spacing.split('\\');

    // Return result & end loop.
    const res = {
      // see http://dicom.nema.org/medical/Dicom/2015a/output/chtml/part03/sect_C.7.4.html
      frameOfReferenceUID: tags.frame_of_reference_uid,

      // Retrieve from tag
      // @warning May differ from loaded quality!
      rows: parseFloat(tags.rows),
      columns: parseFloat(tags.columns),

      // See ftp://dicom.nema.org/MEDICAL/dicom/2015b/output/chtml/part03/sect_C.7.6.2.html

      // Retrieved from tag `Image Orientation (Patient)`
      rowCosines: new cornerstoneMath.Vector3(
        parseFloat(imageOrientation[0]),
        parseFloat(imageOrientation[1]),
        parseFloat(imageOrientation[2]),
      ),
      columnCosines: new cornerstoneMath.Vector3(
        parseFloat(imageOrientation[3]),
        parseFloat(imageOrientation[4]),
        parseFloat(imageOrientation[5]),
      ),

      // Retrieve from tag  Image Position (Patient)`
      imagePositionPatient: new cornerstoneMath.Vector3(
        parseFloat(imagePosition[0]),
        parseFloat(imagePosition[1]),
        parseFloat(imagePosition[2]),
      ),
      rowPixelSpacing: parseFloat(pixelSpacing[0]),
      columnPixelSpacing: parseFloat(pixelSpacing[1]),
      triggerTime: tags.data.triggerTime,
    };
    return res;
  }
  function metaDataProvider(type: any, imageId: any) {
    if (type === 'imagePlane' || type === 'imagePlaneModule') {
      for (const instanceId in instanceTag) {
        if (imageId.includes(instanceId)) {
          return returnMetaDataProvider(instanceTag[instanceId]);
        }
      }
    }
    return;
  }
  cornerstone.metaData.addProvider(metaDataProvider);
};
