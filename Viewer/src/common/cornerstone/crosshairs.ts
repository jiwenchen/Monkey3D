import * as cornerstoneTools from 'cornerstone-tools';
import _ from 'lodash';
import { getDvaApp } from 'umi';
import cornerstone from 'cornerstone-core';
import csTools from 'cornerstone-tools';
const getNewContext = csTools.importInternal('drawing/getNewContext');
const draw = csTools.importInternal('drawing/draw');
const drawLines = csTools.importInternal('drawing/drawLines');
const lineSegDistance = csTools.importInternal('util/lineSegDistance');
const angleBetweenPoints = csTools.importInternal('util/angleBetweenPoints');
const getActiveTool = csTools.importInternal('util/getActiveTool');

const OPERATION = {
  DRAG: 1,
  ROTATE: 2,
};
const CROSSHAIRSCOLOR = {
  0: { horizontal: 'green', vertical: 'yellow' },
  1: { horizontal: 'red', vertical: 'yellow' },
  2: { horizontal: 'red', vertical: 'green' },
};
const POINTRADIUS = 5;
const LINEWIDTH = 1;
const ACTIVELINEWIDTH = 2.5;
const NEARLINEDISTANCE = 2.5;
const THROTTLEWAIT = 150;

export default class Crosshairs {
  activeOperation: number | null;
  crosshairsPoint: { x: number; y: number } | null;
  imgId: string;
  element: HTMLElement;
  angle: number;
  activeTool: string | undefined;
  activeLineType: string | undefined;
  horizontalLine: any | null;
  verticalLine: any | null;
  constructor(imgId: string, element: HTMLElement) {
    this.imgId = imgId;
    this.element = element;
    this.crosshairsPoint = null;
    this.activeOperation = null;
    this.angle = 0;
    this.activeTool = undefined;
    this.activeLineType = undefined;
    this.horizontalLine = null;
    this.verticalLine = null;
    this._renderCallback = this._renderCallback.bind(this);
    this._mouseMoveCallback = this._mouseMoveCallback.bind(this);
    this._mouseDragCallback = this._mouseDragCallback.bind(this);
    this._mouseUpCallback = this._mouseUpCallback.bind(this);
    this._mouseDownCallback = this._mouseDownCallback.bind(this);
  }
  _activate(element: any) {
    element.addEventListener('cornerstoneimagerendered', this._renderCallback);
    element.addEventListener('cornerstonetoolsmousemove', this._mouseMoveCallback);
    element.addEventListener('cornerstonetoolsmousedrag', this._mouseDragCallback);
    element.addEventListener('cornerstonetoolsmouseup', this._mouseUpCallback);
    element.addEventListener('cornerstonetoolsmousedown', this._mouseDownCallback);
  }
  _deactivate(element: any) {
    element.removeEventListener('cornerstoneimagerendered', this._renderCallback);
    element.removeEventListener('cornerstonetoolsmousemove', this._mouseMoveCallback);
    element.removeEventListener('cornerstonetoolsmousedrag', this._mouseDragCallback);
    element.removeEventListener('cornerstonetoolsmouseup', this._mouseUpCallback);
    element.removeEventListener('cornerstonetoolsmousedown', this._mouseDownCallback);
  }
  _renderCallback(evt: any) {
    const { element, canvasContext } = evt.detail;
    if (this.crosshairsPoint === null) {
      this.initCrosshairsData(evt);
    }
    const context = getNewContext(canvasContext.canvas);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    draw(context, (context: any) => {
      // draw horizontal line
      drawLines(context, element, this.horizontalLine, {
        color: CROSSHAIRSCOLOR[this.imgId].horizontal,
        lineWidth: this.activeOperation === OPERATION.ROTATE ? ACTIVELINEWIDTH : LINEWIDTH,
      });
      // draw vertical line
      drawLines(context, element, this.verticalLine, {
        color: CROSSHAIRSCOLOR[this.imgId].vertical,
        lineWidth: this.activeOperation === OPERATION.ROTATE ? ACTIVELINEWIDTH : LINEWIDTH,
      });
    });
  }
  initCrosshairsData(evt: any) {
    const { image } = evt.detail;
    const { width: imgWidth, height: imgHeight } = image;
    this.crosshairsPoint = this.crosshairsPoint
      ? this.crosshairsPoint
      : { x: imgWidth / 2, y: imgHeight / 2 };
    this.horizontalLine = [
      {
        start: { x: 0, y: this.crosshairsPoint!.y },
        end: {
          x: this.crosshairsPoint!.x - POINTRADIUS * 2,
          y: this.crosshairsPoint!.y,
        },
      },
      {
        start: {
          x: this.crosshairsPoint!.x + POINTRADIUS * 2,
          y: this.crosshairsPoint!.y,
        },
        end: { x: imgWidth, y: this.crosshairsPoint!.y },
      },
    ];
    this.verticalLine = [
      {
        start: {
          x: this.crosshairsPoint!.x,
          y: 0,
        },
        end: {
          x: this.crosshairsPoint!.x,
          y: this.crosshairsPoint!.y - POINTRADIUS * 2,
        },
      },
      {
        start: {
          x: this.crosshairsPoint!.x,
          y: this.crosshairsPoint!.y + POINTRADIUS * 2,
        },
        end: {
          x: this.crosshairsPoint!.x,
          y: imgHeight,
        },
      },
    ];
  }
  _mouseMoveCallback(evt: any) {
    let updateImage = false;
    const { element, currentPoints } = evt.detail;
    if (this.crosshairsPoint === null) return false;
    const isNearPoint =
      distanceBetweenPoints(currentPoints.image, this.crosshairsPoint!) <= POINTRADIUS * 2;
    const activeLine = this.getActiveLine(evt);
    const isNearLines = Boolean(activeLine);
    if (isNearPoint) {
      updateImage = this.activeOperation === OPERATION.ROTATE;
      this.activeOperation = OPERATION.DRAG;
    } else if (isNearLines) {
      updateImage = this.activeOperation !== OPERATION.ROTATE;
      this.activeOperation = OPERATION.ROTATE;
      this.activeLineType = activeLine;
    } else {
      updateImage = this.activeOperation === OPERATION.ROTATE;
      this.activeOperation = null;
    }
    if (updateImage) {
      cornerstone.updateImage(element, true);
    }
    return false;
  }
  _mouseDownCallback(evt: any) {
    if (this.activeOperation === null) return false;
    const { element, buttons } = evt.detail;
    const activeTool = getActiveTool(element, buttons);
    if (activeTool) {
      this.activeTool = activeTool.name;
      cornerstoneTools.setToolEnabledForElement(element, this.activeTool);
    }
    return false;
  }
  _mouseDragCallback = _.throttle(this._dragCallback, THROTTLEWAIT);
  _dragCallback(evt: any) {
    const { image, element, currentPoints, deltaPoints, startPoints, viewport } = evt.detail;
    if (deltaPoints.image.x === 0 && deltaPoints.image.y === 0) return false;
    if (this.activeOperation === null) return false;
    if (this.activeOperation === OPERATION.DRAG) {
      const isInImage = this.isPointInImage(currentPoints.image, image);
      if (!isInImage) {
        return;
      }
      this.crosshairsPoint = { ...currentPoints.image };
      // update reference lines
      this._dragCrosshairs(evt);
      // update image
      getDvaApp()._store.dispatch({
        type: 'image3DModel/panMpr',
        payload: {
          plane_type: this.imgId,
          x: currentPoints.image.x,
          y: currentPoints.image.y,
        },
      });
    } else if (this.activeOperation === OPERATION.ROTATE) {
      // update reference lines
      this._rotateCrosshairs(evt);
      const rect = element.getBoundingClientRect(element);
      const { clientWidth: width, clientHeight: height } = element;
      const { scale, translation } = viewport;
      const centerPoints = {
        x: rect.left + width / 2 + translation.x * scale,
        y: rect.top + height / 2 + translation.y * scale,
      };
      // update image
      const angleInfo = angleBetweenPoints(centerPoints, startPoints.client, currentPoints.client);
      if (angleInfo.direction < 0) {
        angleInfo.angle = -angleInfo.angle;
      }
      this.angle = angleInfo.angle;
      getDvaApp()._store.dispatch({
        type: 'image3DModel/rotatech',
        payload: {
          plane_type: this.imgId,
          angle: angleInfo.angle,
        },
      });
    }
    cornerstone.updateImage(element, true);
    return false;
  }
  _mouseUpCallback(evt: any) {
    if (this.activeOperation === null || !this.activeTool) return;
    const { element } = evt.detail;
    cornerstoneTools.setToolActiveForElement(element, this.activeTool, {
      mouseButtonMask: 1,
    });
  }
  getActiveLine(evt: any) {
    const { element, currentPoints } = evt.detail;
    const coords = currentPoints.canvas;

    for (let i = 0; i < this.horizontalLine.length; i++) {
      const line = this.horizontalLine[i];
      const distanceToLine = lineSegDistance(element, line.start, line.end, coords);
      if (distanceToLine <= NEARLINEDISTANCE) {
        return 'horizontalLine';
      }
    }

    for (let i = 0; i < this.verticalLine.length; i++) {
      const line = this.verticalLine[i];
      const distanceToLine = lineSegDistance(element, line.start, line.end, coords);
      if (distanceToLine <= NEARLINEDISTANCE) {
        return 'verticalLine';
      }
    }
    return undefined;
  }
  _dragCrosshairs(evt: any) {
    if (this.crosshairsPoint === null) return;
    // Find the line-equation that has horizontalLine's slope which new center point (i.e the updated crosshair coordinates)
    const hLineEqSlope = getTwoPointsEquation(
      this.horizontalLine[0].start,
      this.horizontalLine[1].end,
    ).slope;
    const hLineEqYAxis =
      hLineEqSlope !== Infinity
        ? this.crosshairsPoint.y - hLineEqSlope * this.crosshairsPoint.x
        : this.crosshairsPoint.x;
    const hEq = { slope: hLineEqSlope, yAxis: hLineEqYAxis };

    // Find the line-equation that has verticalLine's slope which new center point (i.e the updated crosshair coordinates)
    const vLineEqSlope = getTwoPointsEquation(
      this.verticalLine[0].start,
      this.verticalLine[1].end,
    ).slope;
    const vLineEqYAxis =
      vLineEqSlope !== Infinity
        ? this.crosshairsPoint.y - vLineEqSlope * this.crosshairsPoint.x
        : this.crosshairsPoint.x;
    const vEq = { slope: vLineEqSlope, yAxis: vLineEqYAxis };
    this._updateReferenceLines(evt, hEq, vEq);
  }
  _rotateCrosshairs(evt: any) {
    if (!this.activeLineType) return;
    const { currentPoints } = evt.detail;
    const activeLineEq = getTwoPointsEquation(this.crosshairsPoint!, currentPoints.image);
    const anotherLineEq = getVerticalLineEquation(activeLineEq, this.crosshairsPoint!);
    let horizontalEquation, verticalEquation;
    if (this.activeLineType === 'horizontalLine') {
      horizontalEquation = { ...activeLineEq };
      verticalEquation = { ...anotherLineEq };
    } else {
      horizontalEquation = { ...anotherLineEq };
      verticalEquation = { ...activeLineEq };
    }
    this._updateReferenceLines(evt, horizontalEquation, verticalEquation);
  }
  _updateReferenceLines(
    evt: any,
    horizontalEquation: { slope: any; yAxis: any },
    verticalEquation: { slope: any; yAxis: any },
  ) {
    if (!this.activeLineType) return;
    const { image } = evt.detail;
    const horizontalExternalPoints = intersectPointsInRect(
      { width: image.width, height: image.height },
      horizontalEquation,
    );
    const verticalExternalPoints = intersectPointsInRect(
      { width: image.width, height: image.height },
      verticalEquation,
    );
    const horizontalInternalPoints = findIntersectionPointsCircleLine(
      this.crosshairsPoint!,
      POINTRADIUS * 2,
      horizontalEquation,
      horizontalExternalPoints[0],
    );
    const verticalInternalPoints = findIntersectionPointsCircleLine(
      this.crosshairsPoint!,
      POINTRADIUS * 2,
      verticalEquation,
      verticalExternalPoints[0],
    );
    this.horizontalLine[0].start = { ...horizontalExternalPoints[0] };
    this.horizontalLine[0].end = { ...horizontalInternalPoints[0] };
    this.horizontalLine[1].start = { ...horizontalInternalPoints[1] };
    this.horizontalLine[1].end = { ...horizontalExternalPoints[1] };

    this.verticalLine[0].start = { ...verticalExternalPoints[0] };
    this.verticalLine[0].end = { ...verticalInternalPoints[0] };
    this.verticalLine[1].start = { ...verticalInternalPoints[1] };
    this.verticalLine[1].end = { ...verticalExternalPoints[1] };
  }
  isPointInImage(point: { x: number; y: number }, image: { width: number; height: number }) {
    let inImage = true;
    if (point.x < 0 || point.x > image.width - 1 || point.y < 0 || point.y > image.height - 1) {
      inImage = false;
    }
    return inImage;
  }
}
function getTwoPointsEquation(from: { x: number; y: number }, to: { x: number; y: number }) {
  let slope = 0;
  let yAxis;
  if (from.x - to.x) {
    //y = slope * x + yAxisVal
    slope = (from.y - to.y) / (from.x - to.x);
    yAxis = from.y - slope * from.x;
  } else {
    //the line vertical
    //x=yAxis
    slope = Infinity;
    yAxis = from.x;
  }
  slope = +slope.toFixed(2);
  return { slope, yAxis };
}
function intersectPointsInRect(
  Rect: { width: any; height: any },
  eq: { yAxis: number; slope: number },
) {
  // This function is for finding two intersection points on image(or something like rectangle)
  // ref) https://blog.csdn.net/qq_43046501/article/details/105518929
  const w = Rect.width;
  const h = Rect.height;
  let res = [];
  const x1 = 0;
  const y1 = eq.yAxis;
  const x2 = w;
  const y2 = eq.slope * x2 + eq.yAxis;
  const y3 = h;
  const x3 = (h - eq.yAxis) / eq.slope;
  const y4 = 0;
  const x4 = -eq.yAxis / eq.slope;
  if (eq.slope === Infinity && eq.yAxis >= 0) {
    res = [
      {
        x: eq.yAxis,
        y: 0,
      },
      {
        x: eq.yAxis,
        y: h,
      },
    ];
  } else if (eq.slope === 0 && eq.yAxis >= 0) {
    res = [
      {
        x: 0,
        y: eq.yAxis,
      },
      {
        x: w,
        y: eq.yAxis,
      },
    ];
  } else {
    if (y1 <= h && y1 >= 0) {
      res.push({
        x: x1,
        y: y1,
      });
    }
    if (y2 <= h && y2 >= 0) {
      res.push({
        x: x2,
        y: y2,
      });
    }
    if (x3 < w && x3 > 0) {
      res.push({
        x: x3,
        y: y3,
      });
    }
    if (x4 < w && x4 > 0) {
      res.push({
        x: x4,
        y: y4,
      });
    }
  }

  if (res.length !== 2) {
    console.warn(
      'intersectPointsInRect waring! cannot find interacition points. Used default points',
    );
    res = [
      {
        x: x1,
        y: y1,
      },
      {
        x: x2,
        y: y2,
      },
    ];
  }

  // check if return data is 2 points
  return res;
}
function findIntersectionPointsCircleLine(
  circleCenter: { x: any; y: any },
  radius: number,
  lineAtrr: { slope: any; yAxis: any },
  standardPt: { x: any; y: number } | { x: number; y: any },
) {
  //  Find the Points of Intersection of a Circle with a Line
  //y=k*x+b        (𝑥−x0)2+(𝑦−y0)2=𝑟2
  //lineAtrr:slope->k,yAxis->b
  let points: { x: any; y: any }[] = [];
  let pt1, pt2;
  const x0 = circleCenter.x;
  const y0 = circleCenter.y;
  const k = lineAtrr.slope;
  const b = lineAtrr.yAxis;
  //substitute  y=k*x+b  into (𝑥−x0)2+(𝑦−y0)2=𝑟2
  //𝐴𝑥2+𝐵𝑥+𝐶=0
  let sqrtNum = -1;
  if (k !== Infinity) {
    sqrtNum = Math.sqrt(
      4 * Math.pow(k * b - k * y0 - x0, 2) -
        4 * (1 + k * k) * (x0 * x0 + Math.pow(b - y0, 2) - radius * radius),
    );
  }
  if (k === Infinity) {
    //the vertical lines 𝑥=𝑘
    pt1 = {
      x: x0,
      y: y0 - radius,
    };
    pt2 = {
      x: x0,
      y: y0 + radius,
    };
    points = [pt1, pt2];
  } else if (sqrtNum === 0) {
    // one intersection point
    const x = (2 * x0 + 2 * k * y0 - 2 * k * b + sqrtNum) / (2 * (1 + k * k));
    const y = k * x + b;
    pt1 = {
      x: x,
      y: y,
    };
    points = [pt1];
  } else if (sqrtNum > 0) {
    //two intersection points
    const x1 = (2 * x0 + 2 * k * y0 - 2 * k * b - sqrtNum) / (2 * (1 + k * k));
    const x2 = (2 * x0 + 2 * k * y0 - 2 * k * b + sqrtNum) / (2 * (1 + k * k));
    const y1 = k * x1 + b;
    const y2 = k * x2 + b;
    pt1 = {
      x: x1,
      y: y1,
    };
    pt2 = {
      x: x2,
      y: y2,
    };
    points = [pt1, pt2];
    if (standardPt) {
      const d1 = distanceBetweenPoints(pt1, standardPt);
      const d2 = distanceBetweenPoints(pt2, standardPt);
      if (d1 > d2) {
        points = [pt2, pt1];
      }
    }
  }

  return points;
}
function distanceBetweenPoints(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
}

function getVerticalLineEquation(baseline: { slope: number }, basePoint: { x: number; y: number }) {
  let slope, axis;
  if (baseline.slope === 0) slope = Infinity;
  else if (baseline.slope === Infinity) slope = 0;
  else slope = -1 / baseline.slope;

  if (slope === Infinity) axis = basePoint.x;
  else axis = basePoint.y - slope * basePoint.x;
  return { slope: slope, yAxis: axis };
}
