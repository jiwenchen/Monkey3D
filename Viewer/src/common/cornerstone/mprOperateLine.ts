import _ from 'lodash';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
const angleBetweenPoints = cornerstoneTools.importInternal('util/angleBetweenPoints');

let mprOperateLines: any = [];
class MprOperateLine {
  public sliceType: string;
  public horizontalLine: any;
  public horizontalStartRotatePoint: any;
  public horizontalEndRotatePoint: any;
  public horizontalTopSliceLine: any;
  public horizontalBottomSliceLine: any;
  public verticalLine: any;
  public verticalStartRotatePoint: any;
  public verticalEndRotatePoint: any;
  public verticalTopSliceLine: any;
  public verticalBottomSliceLine: any;
  public centerCircle: any;
  public circleDia: number;
  public sliceMode: boolean;
  public rotateMode: boolean;
  public element: any;
  public centerSpacing: number;
  public lastAngle: any;
  public angeleData: number;
  public centerAngle: number;
  constructor(type: string) {
    this.sliceType = type;
    this.horizontalLine = {};
    this.horizontalStartRotatePoint = {};
    this.horizontalEndRotatePoint = {};
    this.horizontalTopSliceLine = {};
    this.horizontalBottomSliceLine = {};
    this.verticalLine = {};
    this.verticalStartRotatePoint = {};
    this.verticalEndRotatePoint = {};
    this.verticalTopSliceLine = {};
    this.verticalBottomSliceLine = {};
    this.centerCircle = {};
    this.circleDia = 6;
    this.sliceMode = true;
    this.rotateMode = true;
    this.element = null;
    this.centerSpacing = 10;
    this.lastAngle = null;
    this.angeleData = 0;
    this.centerAngle = 0;
    this._onImageRendered = this._onImageRendered.bind(this);
    this._mouseMoveCallback = this._mouseMoveCallback.bind(this);
    this._mouseDownCallback = this._mouseDownCallback.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  init(element: HTMLElement) {
    this.element = element;
    let width = this.element.clientWidth;
    let height = this.element.clientHeight;
    //中心圆
    this.centerCircle = {
      point: {
        x: Math.round(width / 2),
        y: Math.round(height / 2),
      },
      imagePoint: cornerstone.canvasToPixel(this.element, {
        _canvasCoordinateBrand: '',
        x: Math.round(width / 2),
        y: Math.round(height / 2),
      }),
      active: false,
      color: 'red',
    };
    //水平线
    this.horizontalLine = {
      startPoint: {},
      endPoint: {},
      direction: {
        x: 1,
        y: 0,
      },
      active: false,
    };
    //水平起始旋转点
    this.horizontalStartRotatePoint = {
      rotatePoint: {},
      active: false,
    };
    //水平结束旋转点
    this.horizontalEndRotatePoint = {
      rotatePoint: {},
      active: false,
    };
    // 水平顶部虚线
    this.horizontalTopSliceLine = {
      startPoint: {},
      endPoint: {},
      startSlicePoint: {},
      endSlicePoint: {},
      sliceThick: 0,
      active: false,
    };
    //水平底部虚线
    this.horizontalBottomSliceLine = {
      startPoint: {},
      endPoint: {},
      startSlicePoint: {},
      endSlicePoint: {},
      sliceThick: 0,
      active: false,
    };
    // 垂直线
    this.verticalLine = {
      startPoint: {},
      endPoint: {},
      direction: {
        x: 0,
        y: 1,
      },
      active: false,
    };
    //垂直起始旋转点
    this.verticalStartRotatePoint = {
      rotatePoint: {},
      active: false,
    };
    //垂直结束旋转点
    this.verticalEndRotatePoint = {
      rotatePoint: {},
      active: false,
    };
    //垂直顶部虚线
    this.verticalTopSliceLine = {
      startPoint: {},
      endPoint: {},
      startSlicePoint: {},
      endSlicePoint: {},
      sliceThick: 0,
      active: false,
    };
    //垂直底部虚线
    this.verticalBottomSliceLine = {
      startPoint: {},
      endPoint: {},
      startSlicePoint: {},
      endSlicePoint: {},
      sliceThick: 0,
      active: false,
    };
    this._calculateAllPosition();
    if (this.sliceType === 'Axial') {
      this.horizontalLine.color = 'rgb(224, 200, 12)';
      this.horizontalLine.type = 'Coronal';
      this.verticalLine.color = 'rgb(223, 53, 120)';
      this.verticalLine.type = 'Sagittal';
    }
    if (this.sliceType === 'Coronal') {
      this.horizontalLine.color = 'rgb(48, 178, 242)';
      this.horizontalLine.type = 'Axial';
      this.verticalLine.color = 'rgb(223, 53, 120)';
      this.verticalLine.type = 'Sagittal';
    }
    if (this.sliceType === 'Sagittal') {
      this.horizontalLine.color = 'rgb(48, 178, 242)';
      this.horizontalLine.type = 'Axial';
      this.verticalLine.color = 'rgb(224, 200, 12)';
      this.verticalLine.type = 'Coronal';
    }

    element.removeEventListener(cornerstone.EVENTS.IMAGE_RENDERED, this._onImageRendered);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, this._mouseMoveCallback);
    element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DOWN, this._mouseDownCallback);

    element.addEventListener(cornerstone.EVENTS.IMAGE_RENDERED, this._onImageRendered);
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, this._mouseMoveCallback);
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_DOWN, this._mouseDownCallback);
    element.addEventListener(cornerstone.EVENTS.ELEMENT_RESIZED, this._onResize);
    cornerstone.updateImage(element);
  }

  _calculateAllPosition() {
    let obj = this;
    let width = obj.element.clientWidth;
    let height = obj.element.clientHeight;
    let rotatePos = width < height ? Math.round(width * 0.4) : Math.round(height * 0.4);
    let slicePos = width < height ? Math.round(width * 0.2) : Math.round(height * 0.2);

    // 计算水平组
    {
      if (obj.horizontalLine.direction.x === 0 && Math.abs(obj.horizontalLine.direction.y) === 1) {
        obj.horizontalLine.startPoint.x = obj.horizontalLine.endPoint.x = obj.centerCircle.point.x;
        obj.horizontalTopSliceLine.startPoint.x = obj.horizontalTopSliceLine.endPoint.x =
          obj.centerCircle.point.x - obj.horizontalTopSliceLine.sliceThick;
        obj.horizontalBottomSliceLine.startPoint.x = obj.horizontalBottomSliceLine.endPoint.x =
          obj.centerCircle.point.x + obj.horizontalBottomSliceLine.sliceThick;
        obj.horizontalLine.startPoint.y =
          obj.horizontalTopSliceLine.startPoint.y =
          obj.horizontalBottomSliceLine.startPoint.y =
            obj.horizontalLine.direction.y === 1 ? 0 : height;
        obj.horizontalLine.endPoint.y =
          obj.horizontalTopSliceLine.endPoint.y =
          obj.horizontalBottomSliceLine.endPoint.y =
            obj.horizontalLine.direction.y === 1 ? height : 0;
      } else {
        _refreshLine(
          0,
          width,
          0,
          height,
          obj.centerCircle.point,
          obj.horizontalLine.direction,
          obj.horizontalLine,
        );

        let topSlicePoint = {
          x:
            obj.centerCircle.point.x -
            obj.verticalLine.direction.x * obj.horizontalTopSliceLine.sliceThick,
          y:
            obj.centerCircle.point.y -
            obj.verticalLine.direction.y * obj.horizontalTopSliceLine.sliceThick,
        };
        _refreshLine(
          0,
          width,
          0,
          height,
          topSlicePoint,
          obj.horizontalLine.direction,
          obj.horizontalTopSliceLine,
        );

        let bottomSlicePoint = {
          x:
            obj.centerCircle.point.x +
            obj.verticalLine.direction.x * obj.horizontalBottomSliceLine.sliceThick,
          y:
            obj.centerCircle.point.y +
            obj.verticalLine.direction.y * obj.horizontalBottomSliceLine.sliceThick,
        };
        _refreshLine(
          0,
          width,
          0,
          height,
          bottomSlicePoint,
          obj.horizontalLine.direction,
          obj.horizontalBottomSliceLine,
        );
      }

      let vextorM = Math.sqrt(
        Math.pow(obj.horizontalLine.direction.x, 2) + Math.pow(obj.horizontalLine.direction.y, 2),
      );
      obj.horizontalStartRotatePoint.rotatePoint.x =
        obj.centerCircle.point.x - (obj.horizontalLine.direction.x / vextorM) * rotatePos;
      obj.horizontalStartRotatePoint.rotatePoint.y =
        obj.centerCircle.point.y - (obj.horizontalLine.direction.y / vextorM) * rotatePos;
      obj.horizontalEndRotatePoint.rotatePoint.x =
        obj.centerCircle.point.x + (obj.horizontalLine.direction.x / vextorM) * rotatePos;
      obj.horizontalEndRotatePoint.rotatePoint.y =
        obj.centerCircle.point.y + (obj.horizontalLine.direction.y / vextorM) * rotatePos;

      vextorM = Math.sqrt(
        Math.pow(obj.verticalLine.direction.x, 2) + Math.pow(obj.verticalLine.direction.y, 2),
      );
      let topSlicePoint = {
        x:
          obj.centerCircle.point.x -
          (obj.verticalLine.direction.x / vextorM) * obj.horizontalTopSliceLine.sliceThick,
        y:
          obj.centerCircle.point.y -
          (obj.verticalLine.direction.y / vextorM) * obj.horizontalTopSliceLine.sliceThick,
      };
      obj.horizontalTopSliceLine.startSlicePoint.x =
        topSlicePoint.x - (obj.horizontalLine.direction.x / vextorM) * slicePos;
      obj.horizontalTopSliceLine.startSlicePoint.y =
        topSlicePoint.y - (obj.horizontalLine.direction.y / vextorM) * slicePos;
      obj.horizontalTopSliceLine.endSlicePoint.x =
        topSlicePoint.x + (obj.horizontalLine.direction.x / vextorM) * slicePos;
      obj.horizontalTopSliceLine.endSlicePoint.y =
        topSlicePoint.y + (obj.horizontalLine.direction.y / vextorM) * slicePos;

      let bottomSlicePoint = {
        x:
          obj.centerCircle.point.x +
          (obj.verticalLine.direction.x / vextorM) * obj.horizontalTopSliceLine.sliceThick,
        y:
          obj.centerCircle.point.y +
          (obj.verticalLine.direction.y / vextorM) * obj.horizontalTopSliceLine.sliceThick,
      };
      obj.horizontalBottomSliceLine.startSlicePoint.x =
        bottomSlicePoint.x - (obj.horizontalLine.direction.x / vextorM) * slicePos;
      obj.horizontalBottomSliceLine.startSlicePoint.y =
        bottomSlicePoint.y - (obj.horizontalLine.direction.y / vextorM) * slicePos;
      obj.horizontalBottomSliceLine.endSlicePoint.x =
        bottomSlicePoint.x + (obj.horizontalLine.direction.x / vextorM) * slicePos;
      obj.horizontalBottomSliceLine.endSlicePoint.y =
        bottomSlicePoint.y + (obj.horizontalLine.direction.y / vextorM) * slicePos;
    }
    // 垂直水平线
    {
      if (obj.verticalLine.direction.x === 0 && Math.abs(obj.verticalLine.direction.y) === 1) {
        obj.verticalLine.startPoint.x = obj.verticalLine.endPoint.x = obj.centerCircle.point.x;
        obj.verticalLine.startPoint.y = obj.verticalLine.direction.y === 1 ? 0 : height;
        obj.verticalLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
        obj.verticalTopSliceLine.startPoint.x = obj.verticalTopSliceLine.endPoint.x =
          obj.centerCircle.point.x - obj.verticalTopSliceLine.sliceThick;
        obj.verticalTopSliceLine.startPoint.y = obj.verticalLine.direction.y === 1 ? 0 : height;
        obj.verticalTopSliceLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
        obj.verticalBottomSliceLine.startPoint.x = obj.verticalBottomSliceLine.endPoint.x =
          obj.centerCircle.point.x + obj.verticalBottomSliceLine.sliceThick;
        obj.verticalBottomSliceLine.startPoint.y = obj.verticalLine.direction.y === 1 ? 0 : height;
        obj.verticalBottomSliceLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
      } else {
        _refreshLine(
          0,
          width,
          0,
          height,
          this.centerCircle.point,
          obj.verticalLine.direction,
          obj.verticalLine,
        );

        let topSlicePoint = {
          x:
            obj.centerCircle.point.x -
            obj.horizontalLine.direction.x * obj.verticalTopSliceLine.sliceThick,
          y:
            obj.centerCircle.point.y -
            obj.horizontalLine.direction.y * obj.verticalTopSliceLine.sliceThick,
        };
        _refreshLine(
          0,
          width,
          0,
          height,
          topSlicePoint,
          obj.verticalLine.direction,
          obj.verticalTopSliceLine,
        );

        let bottomSlicePoint = {
          x:
            obj.centerCircle.point.x +
            obj.horizontalLine.direction.x * obj.verticalBottomSliceLine.sliceThick,
          y:
            obj.centerCircle.point.y +
            obj.horizontalLine.direction.y * obj.verticalBottomSliceLine.sliceThick,
        };
        _refreshLine(
          0,
          width,
          0,
          height,
          bottomSlicePoint,
          obj.verticalLine.direction,
          obj.verticalBottomSliceLine,
        );
      }

      obj.verticalStartRotatePoint.rotatePoint.x =
        obj.centerCircle.point.x - obj.verticalLine.direction.x * rotatePos;
      obj.verticalStartRotatePoint.rotatePoint.y =
        obj.centerCircle.point.y - obj.verticalLine.direction.y * rotatePos;
      obj.verticalEndRotatePoint.rotatePoint.x =
        obj.centerCircle.point.x + obj.verticalLine.direction.x * rotatePos;
      obj.verticalEndRotatePoint.rotatePoint.y =
        obj.centerCircle.point.y + obj.verticalLine.direction.y * rotatePos;

      let topSlicePoint = {
        x:
          obj.centerCircle.point.x -
          obj.horizontalLine.direction.x * obj.verticalTopSliceLine.sliceThick,
        y:
          obj.centerCircle.point.y -
          obj.horizontalLine.direction.y * obj.verticalTopSliceLine.sliceThick,
      };
      obj.verticalTopSliceLine.startSlicePoint.x =
        topSlicePoint.x - obj.verticalLine.direction.x * slicePos;
      obj.verticalTopSliceLine.startSlicePoint.y =
        topSlicePoint.y - obj.verticalLine.direction.y * slicePos;
      obj.verticalTopSliceLine.endSlicePoint.x =
        topSlicePoint.x + obj.verticalLine.direction.x * slicePos;
      obj.verticalTopSliceLine.endSlicePoint.y =
        topSlicePoint.y + obj.verticalLine.direction.y * slicePos;

      let bottomSlicePoint = {
        x:
          obj.centerCircle.point.x +
          obj.horizontalLine.direction.x * obj.verticalBottomSliceLine.sliceThick,
        y:
          obj.centerCircle.point.y +
          obj.horizontalLine.direction.y * obj.verticalBottomSliceLine.sliceThick,
      };
      obj.verticalBottomSliceLine.startSlicePoint.x =
        bottomSlicePoint.x - obj.verticalLine.direction.x * slicePos;
      obj.verticalBottomSliceLine.startSlicePoint.y =
        bottomSlicePoint.y - obj.verticalLine.direction.y * slicePos;
      obj.verticalBottomSliceLine.endSlicePoint.x =
        bottomSlicePoint.x + obj.verticalLine.direction.x * slicePos;
      obj.verticalBottomSliceLine.endSlicePoint.y =
        bottomSlicePoint.y + obj.verticalLine.direction.y * slicePos;
    }

    obj.centerCircle.imagePoint = cornerstone.canvasToPixel(obj.element, obj.centerCircle.point);
  }

  moveLines(mouseEventData: any, lineType: string) {
    let obj = this;
    let element = mouseEventData.element;
    let image = cornerstone.getEnabledElement(element).image;
    let width = element.clientWidth;
    let height = element.clientHeight;

    function mouseDragCallback(e: any) {
      const eventData = e.detail;
      const { startPoints, currentPoints, viewport } = eventData;
      if (lineType === 'horizontalLine') {
        obj.horizontalLine.active = true;
        if (
          obj.horizontalLine.direction.x === 0 &&
          Math.abs(obj.horizontalLine.direction.y) === 1
        ) {
          obj.horizontalLine.startPoint.x = obj.horizontalLine.endPoint.x = Math.round(
            eventData.currentPoints.canvas.x,
          );
          obj.horizontalLine.startPoint.y = obj.horizontalLine.direction.y === 1 ? 0 : height;
          obj.horizontalLine.endPoint.y = obj.horizontalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.horizontalLine.direction,
            obj.horizontalLine,
          );
        }
        let newCenter = _segmentsIntr(
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        if (newCenter !== false) {
          obj.centerCircle.point.x = newCenter.x;
          obj.centerCircle.point.y = newCenter.y;
        }
      }
      if (lineType === 'horizontalLineStartRotate') {
        obj.horizontalStartRotatePoint.active = true;
        let newDirectonX = obj.centerCircle.point.x - eventData.currentPoints.canvas.x;
        let newDirectonY = obj.centerCircle.point.y - eventData.currentPoints.canvas.y;
        let vectorM = Math.sqrt(Math.pow(newDirectonX, 2) + Math.pow(newDirectonY, 2));
        obj.horizontalLine.direction.x = newDirectonX / vectorM;
        obj.horizontalLine.direction.y = newDirectonY / vectorM;
        obj.verticalLine.direction.x = -obj.horizontalLine.direction.y;
        obj.verticalLine.direction.y = obj.horizontalLine.direction.x;
      }
      if (lineType === 'horizontalLineEndRotate') {
        obj.horizontalEndRotatePoint.active = true;
        let newDirectonX = eventData.currentPoints.canvas.x - obj.centerCircle.point.x;
        let newDirectonY = eventData.currentPoints.canvas.y - obj.centerCircle.point.y;
        let vectorM = Math.sqrt(Math.pow(newDirectonX, 2) + Math.pow(newDirectonY, 2));
        obj.horizontalLine.direction.x = newDirectonX / vectorM;
        obj.horizontalLine.direction.y = newDirectonY / vectorM;
        obj.verticalLine.direction.x = -obj.horizontalLine.direction.y;
        obj.verticalLine.direction.y = obj.horizontalLine.direction.x;
      }
      if (lineType === 'horizontalLineTopSlice') {
        obj.horizontalTopSliceLine.active = true;
        if (
          obj.horizontalLine.direction.x === 0 &&
          Math.abs(obj.horizontalLine.direction.y) === 1
        ) {
          obj.horizontalTopSliceLine.startPoint.x = eventData.currentPoints.canvas.x;
          obj.horizontalTopSliceLine.startPoint.y =
            obj.horizontalLine.direction.y === 1 ? 0 : height;
          obj.horizontalTopSliceLine.endPoint.x = eventData.currentPoints.canvas.x;
          obj.horizontalTopSliceLine.endPoint.y = obj.horizontalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.horizontalLine.direction,
            obj.horizontalTopSliceLine,
          );
        }

        let inter1: any = _segmentsIntr(
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        let inter2: any = _segmentsIntr(
          obj.horizontalTopSliceLine.startPoint,
          obj.horizontalTopSliceLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        let dis = Math.sqrt(
          Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
        );
        if (dis !== 0) {
          let vectorM = Math.sqrt(
            Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
          );
          let nx = (inter1?.x - inter2?.x) / vectorM;
          let ny = (inter1?.y - inter2?.y) / vectorM;
          if (nx * obj.verticalLine.direction.x + ny * obj.verticalLine.direction.y + 1 < 0.005) {
            dis = -dis;
          }
        }
        obj.horizontalTopSliceLine.sliceThick = obj.horizontalBottomSliceLine.sliceThick = Math.max(
          dis,
          0,
        );
      }
      if (lineType === 'horizontalLineBottomSlice') {
        obj.horizontalBottomSliceLine.active = true;
        if (
          obj.horizontalLine.direction.x === 0 &&
          Math.abs(obj.horizontalLine.direction.y) === 1
        ) {
          obj.horizontalBottomSliceLine.startPoint.x = eventData.currentPoints.canvas.x;
          obj.horizontalBottomSliceLine.startPoint.y =
            obj.horizontalLine.direction.y === 1 ? 0 : height;
          obj.horizontalBottomSliceLine.endPoint.x = eventData.currentPoints.canvas.x;
          obj.horizontalBottomSliceLine.endPoint.y =
            obj.horizontalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.horizontalLine.direction,
            obj.horizontalBottomSliceLine,
          );
        }

        let inter1: any = _segmentsIntr(
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        let inter2: any = _segmentsIntr(
          obj.horizontalBottomSliceLine.startPoint,
          obj.horizontalBottomSliceLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        let dis = Math.sqrt(
          Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
        );
        if (dis !== 0) {
          let vectorM = Math.sqrt(
            Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
          );
          let nx = (inter1?.x - inter2?.x) / vectorM;
          let ny = (inter1?.y - inter2?.y) / vectorM;
          if (nx * obj.verticalLine.direction.x + ny * obj.verticalLine.direction.y - 1 > -0.005) {
            dis = -dis;
          }
        }
        obj.horizontalTopSliceLine.sliceThick = obj.horizontalBottomSliceLine.sliceThick = Math.max(
          dis,
          0,
        );
      }
      if (lineType === 'verticalLine') {
        obj.verticalLine.active = true;
        if (obj.verticalLine.direction.x === 0 && Math.abs(obj.verticalLine.direction.y) === 1) {
          obj.verticalLine.startPoint.x = Math.round(eventData.currentPoints.canvas.x);
          obj.verticalLine.startPoint.y = obj.verticalLine.direction.y === 1 ? 0 : height;
          obj.verticalLine.endPoint.x = Math.round(eventData.currentPoints.canvas.x);
          obj.verticalLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.verticalLine.direction,
            obj.verticalLine,
          );
        }

        let newCenter = _segmentsIntr(
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
        );
        if (newCenter !== false) {
          obj.centerCircle.point.x = newCenter.x;
          obj.centerCircle.point.y = newCenter.y;
        }
      }
      if (lineType === 'verticalLineStartRotate') {
        obj.verticalStartRotatePoint.active = true;
        let newDirectonX = obj.centerCircle.point.x - eventData.currentPoints.canvas.x;
        let newDirectonY = obj.centerCircle.point.y - eventData.currentPoints.canvas.y;
        let vectorM = Math.sqrt(Math.pow(newDirectonX, 2) + Math.pow(newDirectonY, 2));
        obj.verticalLine.direction.x = newDirectonX / vectorM;
        obj.verticalLine.direction.y = newDirectonY / vectorM;
        obj.horizontalLine.direction.x = -obj.verticalLine.direction.y;
        obj.horizontalLine.direction.y = obj.verticalLine.direction.x;
      }
      if (lineType === 'verticalLineEndRotate') {
        obj.verticalEndRotatePoint.active = true;
        let newDirectonX = eventData.currentPoints.canvas.x - obj.centerCircle.point.x;
        let newDirectonY = eventData.currentPoints.canvas.y - obj.centerCircle.point.y;
        let vectorM = Math.sqrt(Math.pow(newDirectonX, 2) + Math.pow(newDirectonY, 2));
        obj.verticalLine.direction.x = newDirectonX / vectorM;
        obj.verticalLine.direction.y = newDirectonY / vectorM;
        obj.horizontalLine.direction.x = -obj.verticalLine.direction.y;
        obj.horizontalLine.direction.y = obj.verticalLine.direction.x;
      }
      if (lineType === 'verticalLineTopSlice') {
        obj.verticalTopSliceLine.active = true;
        if (obj.verticalLine.direction.x === 0 && Math.abs(obj.verticalLine.direction.y) === 1) {
          obj.verticalTopSliceLine.startPoint.x = eventData.currentPoints.canvas.x;
          obj.verticalTopSliceLine.startPoint.y = obj.verticalLine.direction.y === 1 ? 0 : height;
          obj.verticalTopSliceLine.endPoint.x = eventData.currentPoints.canvas.x;
          obj.verticalTopSliceLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.verticalLine.direction,
            obj.verticalTopSliceLine,
          );
        }

        let inter1: any = _segmentsIntr(
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
        );
        let inter2: any = _segmentsIntr(
          obj.verticalTopSliceLine.startPoint,
          obj.verticalTopSliceLine.endPoint,
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
        );
        let dis = Math.sqrt(
          Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
        );
        if (dis !== 0) {
          let vectorM = Math.sqrt(
            Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
          );
          let nx = (inter1?.x - inter2?.x) / vectorM;
          let ny = (inter1?.y - inter2?.y) / vectorM;
          if (
            nx * obj.horizontalLine.direction.x + ny * obj.horizontalLine.direction.y + 1 <
            0.005
          ) {
            dis = -dis;
          }
        }
        obj.verticalTopSliceLine.sliceThick = obj.verticalBottomSliceLine.sliceThick = Math.max(
          dis,
          0,
        );
      }
      if (lineType === 'verticalLineBottomSlice') {
        obj.verticalBottomSliceLine.active = true;
        if (obj.verticalLine.direction.x === 0 && Math.abs(obj.verticalLine.direction.y) === 1) {
          obj.verticalBottomSliceLine.startPoint.x = eventData.currentPoints.canvas.x;
          obj.verticalBottomSliceLine.startPoint.y =
            obj.verticalLine.direction.y === 1 ? 0 : height;
          obj.verticalBottomSliceLine.endPoint.x = eventData.currentPoints.canvas.x;
          obj.verticalBottomSliceLine.endPoint.y = obj.verticalLine.direction.y === 1 ? height : 0;
        } else {
          _refreshLine(
            0,
            width,
            0,
            height,
            eventData.currentPoints.canvas,
            obj.verticalLine.direction,
            obj.verticalBottomSliceLine,
          );
        }

        let inter1: any = _segmentsIntr(
          obj.verticalLine.startPoint,
          obj.verticalLine.endPoint,
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
        );
        let inter2: any = _segmentsIntr(
          obj.verticalBottomSliceLine.startPoint,
          obj.verticalBottomSliceLine.endPoint,
          obj.horizontalLine.startPoint,
          obj.horizontalLine.endPoint,
        );
        let dis = Math.sqrt(
          Math.pow(inter1?.x - inter2?.x, 2) + Math.pow(inter1?.y - inter2?.y, 2),
        );
        if (dis !== 0) {
          let vectorM = Math.sqrt(
            Math.pow(inter1.x - inter2.x, 2) + Math.pow(inter1.y - inter2.y, 2),
          );
          let nx = (inter1.x - inter2.x) / vectorM;
          let ny = (inter1.y - inter2.y) / vectorM;
          if (
            nx * obj.horizontalLine.direction.x + ny * obj.horizontalLine.direction.y - 1 >
            -0.005
          ) {
            dis = -dis;
          }
        }
        obj.verticalTopSliceLine.sliceThick = obj.verticalBottomSliceLine.sliceThick = Math.max(
          dis,
          0,
        );
      }
      if (lineType === 'centerRect') {
        obj.centerCircle.active = true;
        obj.centerCircle.point.x += eventData.deltaPoints.canvas.x;
        obj.centerCircle.point.y += eventData.deltaPoints.canvas.y;
      }

      obj._keepPointInImage(element, image);
      obj._calculateAllPosition();
      cornerstone.updateImage(element);

      function _segmentsIntr(
        a: { x: number; y: number },
        b: { x: number; y: number },
        c: { x: number; y: number },
        d: { x: number; y: number },
      ) {
        let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator === 0) {
          return false;
        }

        let x =
          ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
            (b.y - a.y) * (d.x - c.x) * a.x -
            (d.y - c.y) * (b.x - a.x) * c.x) /
          denominator;
        let y =
          -(
            (b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
            (b.x - a.x) * (d.y - c.y) * a.y -
            (d.x - c.x) * (b.y - a.y) * c.y
          ) / denominator;

        /** 2 判断交点是否在两条线段上 **/
        if (
          // 交点在线段1上
          (x - a.x) * (x - b.x) <= 0 &&
          (y - a.y) * (y - b.y) <= 0 &&
          // 且交点也在线段2上
          (x - c.x) * (x - d.x) <= 0 &&
          (y - c.y) * (y - d.y) <= 0
        ) {
          return {
            x: x,
            y: y,
          };
        }
        return false;
      }
      let eventType = 'CornerstoneToolsMprOperatePositionModified';
      const rect = element.getBoundingClientRect(element);
      const { scale, translation } = viewport;
      const centerPoints = {
        x: rect.left + width / 2 + translation.x * scale,
        y: rect.top + height / 2 + translation.y * scale,
      };
      const angleInfo = angleBetweenPoints(centerPoints, startPoints.client, currentPoints.client);
      if (angleInfo.direction < 0) {
        angleInfo.angle = -angleInfo.angle;
      }
      obj.centerAngle = angleInfo.angle;
      let modifiedEventData = {
        changeType: lineType,
        element: element,
        sliceType: obj.sliceType,
        imagePoint: cornerstone.canvasToPixel(element, obj.centerCircle.point),
        lastAngle: obj.lastAngle ? obj.lastAngle + angleInfo.angle : angleInfo.angle,
      };
      cornerstone.triggerEvent(element, eventType, modifiedEventData);
      return false;
    }

    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, mouseDragCallback);

    function mouseUpCallback(e: any) {
      obj.lastAngle = obj.centerAngle + obj.lastAngle;
      obj.horizontalLine.active = false;
      obj.verticalLine.active = false;
      obj.centerCircle.active = false;
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DRAG, mouseDragCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_UP, mouseUpCallback);
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_CLICK, mouseUpCallback);
      element.addEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);

      // 恢复当前passive工具
      // TODO: 有没有更好的替代方案
      // cornerstoneTools.setToolActiveForElement(
      //   element,
      //   HYIF.viewerbase.toolManager.getActiveTool(),
      //   {
      //     mouseButtonMask: 1,
      //   },
      // );

      cornerstone.updateImage(element);
    }

    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(cornerstoneTools.EVENTS.MOUSE_CLICK, mouseUpCallback);
    return true;
  }

  _keepPointInImage(element: HTMLElement, image: any) {
    let topLeftCanvasPoint = cornerstone.pixelToCanvas(element, {
      _pixelCoordinateBrand: '',
      x: 0,
      y: 0,
    });
    let bottomRightCanvasPoint = cornerstone.pixelToCanvas(element, {
      _pixelCoordinateBrand: '',
      x: image.width - 1,
      y: image.height - 1,
    });
    this.centerCircle.point.x = Math.round(
      Math.max(this.centerCircle.point.x, topLeftCanvasPoint.x),
    );
    this.centerCircle.point.x = Math.round(
      Math.min(this.centerCircle.point.x, bottomRightCanvasPoint.x),
    );
    this.centerCircle.point.y = Math.round(
      Math.max(this.centerCircle.point.y, topLeftCanvasPoint.y),
    );
    this.centerCircle.point.y = Math.round(
      Math.min(this.centerCircle.point.y, bottomRightCanvasPoint.y),
    );
  }

  _mouseMoveCallback = (e: any) => {
    let obj = this;
    let eventData = e.detail;
    cornerstoneTools.toolCoordinates.setCoords(eventData);
    let imageNeedsUpdate = false;
    let coords = eventData.currentPoints.canvas;

    if (
      (_pointNearLine(coords, obj.verticalLine) && !obj.verticalLine.active) ||
      (!_pointNearLine(coords, obj.verticalLine) && obj.verticalLine.active)
    ) {
      obj.verticalLine.active = !obj.verticalLine.active;
      imageNeedsUpdate = true;
    }

    if (
      (_pointNearLine(coords, obj.horizontalLine) && !obj.horizontalLine.active) ||
      (!_pointNearLine(coords, obj.horizontalLine) && obj.horizontalLine.active)
    ) {
      obj.horizontalLine.active = !obj.horizontalLine.active;
      imageNeedsUpdate = true;
    }

    if (this.sliceMode) {
      if (
        (_pointNearSliceLine(coords, obj.horizontalTopSliceLine) &&
          !obj.horizontalTopSliceLine.active) ||
        (!_pointNearSliceLine(coords, obj.horizontalTopSliceLine) &&
          obj.horizontalTopSliceLine.active)
      ) {
        obj.horizontalTopSliceLine.active = !obj.horizontalTopSliceLine.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearSliceLine(coords, obj.horizontalBottomSliceLine) &&
          !obj.horizontalBottomSliceLine.active) ||
        (!_pointNearSliceLine(coords, obj.horizontalBottomSliceLine) &&
          obj.horizontalBottomSliceLine.active)
      ) {
        obj.horizontalBottomSliceLine.active = !obj.horizontalBottomSliceLine.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearSliceLine(coords, obj.verticalTopSliceLine) &&
          !obj.verticalTopSliceLine.active) ||
        (!_pointNearSliceLine(coords, obj.verticalTopSliceLine) && obj.verticalTopSliceLine.active)
      ) {
        obj.verticalTopSliceLine.active = !obj.verticalTopSliceLine.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearSliceLine(coords, obj.verticalBottomSliceLine) &&
          !obj.verticalBottomSliceLine.active) ||
        (!_pointNearSliceLine(coords, obj.verticalBottomSliceLine) &&
          obj.verticalBottomSliceLine.active)
      ) {
        obj.verticalBottomSliceLine.active = !obj.verticalBottomSliceLine.active;
        imageNeedsUpdate = true;
      }
    }

    if (this.rotateMode) {
      if (
        (_pointNearRotatePoint(coords, obj.horizontalStartRotatePoint) &&
          !obj.horizontalStartRotatePoint.active) ||
        (!_pointNearRotatePoint(coords, obj.horizontalStartRotatePoint) &&
          obj.horizontalStartRotatePoint.active)
      ) {
        obj.horizontalStartRotatePoint.active = !obj.horizontalStartRotatePoint.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearRotatePoint(coords, obj.horizontalEndRotatePoint) &&
          !obj.horizontalEndRotatePoint.active) ||
        (!_pointNearRotatePoint(coords, obj.horizontalEndRotatePoint) &&
          obj.horizontalEndRotatePoint.active)
      ) {
        obj.horizontalEndRotatePoint.active = !obj.horizontalEndRotatePoint.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearRotatePoint(coords, obj.verticalStartRotatePoint) &&
          !obj.verticalStartRotatePoint.active) ||
        (!_pointNearRotatePoint(coords, obj.verticalStartRotatePoint) &&
          obj.verticalStartRotatePoint.active)
      ) {
        obj.verticalStartRotatePoint.active = !obj.verticalStartRotatePoint.active;
        imageNeedsUpdate = true;
      }

      if (
        (_pointNearRotatePoint(coords, obj.verticalEndRotatePoint) &&
          !obj.verticalEndRotatePoint.active) ||
        (!_pointNearRotatePoint(coords, obj.verticalEndRotatePoint) &&
          obj.verticalEndRotatePoint.active)
      ) {
        obj.verticalEndRotatePoint.active = !obj.verticalEndRotatePoint.active;
        imageNeedsUpdate = true;
      }
    }

    if (
      (_pointNearCenterRect(coords) && !obj.centerCircle.active) ||
      (!_pointNearCenterRect(coords) && obj.centerCircle.active)
    ) {
      obj.centerCircle.active = !obj.centerCircle.active;
      imageNeedsUpdate = true;
    }

    if (obj.centerCircle.active) {
      obj.verticalLine.active = false;
      obj.horizontalLine.active = false;
    }

    if (
      obj.verticalEndRotatePoint.active ||
      obj.verticalStartRotatePoint.active ||
      obj.verticalTopSliceLine.active ||
      obj.verticalBottomSliceLine.active
    ) {
      obj.verticalLine.active = false;
    }

    if (
      obj.horizontalEndRotatePoint.active ||
      obj.horizontalStartRotatePoint.active ||
      obj.horizontalTopSliceLine.active ||
      obj.horizontalBottomSliceLine.active
    ) {
      obj.horizontalLine.active = false;
    }

    if (imageNeedsUpdate) {
      cornerstone.updateImage(eventData.element);
    }

    function _pointNearLine(coords: { x: number; y: number }, line: any) {
      let lineSegment = {
        start: line.startPoint,
        end: line.endPoint,
      };
      let distanceToLine = cornerstoneTools.external.cornerstoneMath.lineSegment.distanceToPoint(
        lineSegment,
        coords,
      );
      return distanceToLine < 3;
    }

    function _pointNearSliceLine(coords: { x: number; y: number }, line: any) {
      let startRect = {
        left: line.startSlicePoint.x - 1,
        top: line.startSlicePoint.y - 1,
        width: 3,
        height: 3,
      };

      let startDistanceToPoint = cornerstoneTools.external.cornerstoneMath.rect.distanceToPoint(
        startRect,
        coords,
      );
      let endRect = {
        left: line.endSlicePoint.x - 1,
        top: line.endSlicePoint.y - 1,
        width: 3,
        height: 3,
      };
      let endDistanceToPoint = cornerstoneTools.external.cornerstoneMath.rect.distanceToPoint(
        endRect,
        coords,
      );
      return startDistanceToPoint < 3 || endDistanceToPoint < 3;
    }

    function _pointNearRotatePoint(coords: { x: number; y: number }, point: any) {
      let rect = {
        left: point.rotatePoint.x - 3,
        top: point.rotatePoint.y - 3,
        width: 5,
        height: 5,
      };
      let distanceToPoint = cornerstoneTools.external.cornerstoneMath.rect.distanceToPoint(
        rect,
        coords,
      );
      return distanceToPoint < 3;
    }

    function _pointNearCenterRect(coords: { x: number; y: number }) {
      let topLeftPoint = {
        x: obj.centerCircle.point.x - obj.circleDia,
        y: obj.centerCircle.point.y - obj.circleDia,
      };

      let bottomRightPoint = {
        x: obj.centerCircle.point.x + obj.circleDia,
        y: obj.centerCircle.point.y + obj.circleDia,
      };

      let rect = {
        left: Math.min(topLeftPoint.x, bottomRightPoint.x),
        top: Math.min(topLeftPoint.y, bottomRightPoint.y),
        width: Math.abs(topLeftPoint.x - bottomRightPoint.x),
        height: Math.abs(topLeftPoint.y - bottomRightPoint.y),
      };

      let distanceToPoint = cornerstoneTools.external.cornerstoneMath.rect.distanceToPoint(
        rect,
        coords,
      );

      let bInRect = false;
      if (
        coords.x > rect.left &&
        coords.x < rect.left + rect.width &&
        coords.y > rect.top &&
        coords.y < rect.top + rect.height
      ) {
        bInRect = true;
      }

      return distanceToPoint < 2 || bInRect;
    }
  };

  _mouseDownCallback = (e: any) => {
    let obj = this;
    let eventData = e.detail;
    let element = eventData.element;
    let active = false;

    if (obj.verticalLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'verticalLine');
      active = true;
    }

    if (obj.verticalStartRotatePoint.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'verticalLineStartRotate');
      active = true;
    }

    if (obj.verticalEndRotatePoint.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'verticalLineEndRotate');
      active = true;
    }

    if (obj.verticalTopSliceLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'verticalLineTopSlice');
      active = true;
    }

    if (obj.verticalBottomSliceLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'verticalLineBottomSlice');
      active = true;
    }

    if (obj.horizontalLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'horizontalLine');
      active = true;
    }

    if (obj.horizontalStartRotatePoint.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'horizontalLineStartRotate');
      active = true;
    }

    if (obj.horizontalEndRotatePoint.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'horizontalLineEndRotate');
      active = true;
    }

    if (obj.horizontalTopSliceLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'horizontalLineTopSlice');
      active = true;
    }

    if (obj.horizontalBottomSliceLine.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'horizontalLineBottomSlice');
    }

    if (obj.centerCircle.active) {
      element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, obj._mouseMoveCallback);
      this.moveLines(eventData, 'centerRect');
      active = true;
    }
    if (active) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();

      // passive当前工具
      // cornerstoneTools.setToolPassiveForElement(
      //   element,
      //   HYIF.viewerbase.toolManager.getActiveTool(),
      // );
      // return true;
    }
  };

  _onImageRendered = (e: any) => {
    let obj = this;
    let eventData = e.detail;
    let context = eventData.canvasContext.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.save();

    if (e.srcElement.clientHeight === 0 && e.srcElement.clientWidth === 0) {
      return;
    }
    obj.centerCircle.point = cornerstone.pixelToCanvas(this.element, obj.centerCircle.imagePoint);
    this._calculateAllPosition();
    // 水平线
    {
      let color = obj.horizontalLine.color;
      let lineWidth = obj.horizontalLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.moveTo(obj.horizontalLine.startPoint.x, obj.horizontalLine.startPoint.y);
      // context.lineTo(obj.centerCircle.point.x - this.centerSpacing, obj.horizontalLine.endPoint.y);
      // context.moveTo(
      //   obj.centerCircle.point.x + this.centerSpacing,
      //   obj.horizontalLine.startPoint.y,
      // );
      context.lineTo(obj.horizontalLine.endPoint.x, obj.horizontalLine.endPoint.y);
      context.stroke();
      context.save();

      if (this.rotateMode) {
        let rotateDia = obj.horizontalStartRotatePoint.active ? 7 : 5;
        context.moveTo(
          obj.horizontalStartRotatePoint.rotatePoint.x,
          obj.horizontalStartRotatePoint.rotatePoint.y,
        );
        context.arc(
          obj.horizontalStartRotatePoint.rotatePoint.x,
          obj.horizontalStartRotatePoint.rotatePoint.y,
          rotateDia,
          0,
          2 * Math.PI,
        );
        context.fillStyle = color;
        context.fill();

        rotateDia = obj.horizontalEndRotatePoint.active ? 7 : 5;
        context.moveTo(
          obj.horizontalEndRotatePoint.rotatePoint.x,
          obj.horizontalEndRotatePoint.rotatePoint.y,
        );
        context.arc(
          obj.horizontalEndRotatePoint.rotatePoint.x,
          obj.horizontalEndRotatePoint.rotatePoint.y,
          rotateDia,
          0,
          2 * Math.PI,
        );
        context.fill();
        context.save();
      }
    }

    // 水平层厚线
    if (obj.horizontalTopSliceLine.sliceThick > 0) {
      let color = obj.horizontalLine.color;
      let lineWidth = obj.horizontalTopSliceLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.setLineDash([5, 8]);
      context.moveTo(
        obj.horizontalTopSliceLine.startPoint.x,
        obj.horizontalTopSliceLine.startPoint.y,
      );
      context.lineTo(obj.horizontalTopSliceLine.endPoint.x, obj.horizontalTopSliceLine.endPoint.y);
      context.stroke();

      lineWidth = obj.horizontalBottomSliceLine.active ? 2 : 1;
      context.beginPath();
      context.lineWidth = lineWidth;
      context.moveTo(
        obj.horizontalBottomSliceLine.startPoint.x,
        obj.horizontalBottomSliceLine.startPoint.y,
      );
      context.lineTo(
        obj.horizontalBottomSliceLine.endPoint.x,
        obj.horizontalBottomSliceLine.endPoint.y,
      );
      context.stroke();
      context.restore();
    }

    if (this.sliceMode) {
      context.beginPath();
      context.moveTo(
        obj.horizontalTopSliceLine.startSlicePoint.x,
        obj.horizontalTopSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.horizontalTopSliceLine.startSlicePoint.x,
        obj.horizontalTopSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.horizontalTopSliceLine.startSlicePoint.x,
        obj.horizontalTopSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.horizontalTopSliceLine.startSlicePoint.x,
        obj.horizontalTopSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.horizontalTopSliceLine.endSlicePoint.x,
        obj.horizontalTopSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.horizontalTopSliceLine.endSlicePoint.x,
        obj.horizontalTopSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.horizontalTopSliceLine.endSlicePoint.x,
        obj.horizontalTopSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.horizontalTopSliceLine.endSlicePoint.x,
        obj.horizontalTopSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.horizontalBottomSliceLine.startSlicePoint.x,
        obj.horizontalBottomSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.horizontalBottomSliceLine.startSlicePoint.x,
        obj.horizontalBottomSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.horizontalBottomSliceLine.startSlicePoint.x,
        obj.horizontalBottomSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.horizontalBottomSliceLine.startSlicePoint.x,
        obj.horizontalBottomSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.horizontalBottomSliceLine.endSlicePoint.x,
        obj.horizontalBottomSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.horizontalBottomSliceLine.endSlicePoint.x,
        obj.horizontalBottomSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.horizontalBottomSliceLine.endSlicePoint.x,
        obj.horizontalBottomSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.horizontalBottomSliceLine.endSlicePoint.x,
        obj.horizontalBottomSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();
    }

    // 垂直线
    {
      let color = obj.verticalLine.color;
      let lineWidth = obj.verticalLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.moveTo(obj.verticalLine.startPoint.x, obj.verticalLine.startPoint.y);
      // context.lineTo(obj.verticalLine.endPoint.x, obj.centerCircle.point.y - this.centerSpacing);
      // context.moveTo(obj.verticalLine.startPoint.x, obj.centerCircle.point.y + this.centerSpacing);
      context.lineTo(obj.verticalLine.endPoint.x, obj.verticalLine.endPoint.y);
      context.stroke();
      context.save();

      if (this.rotateMode) {
        let rotateDia = obj.verticalStartRotatePoint.active ? 8 : 5;
        context.moveTo(
          obj.verticalStartRotatePoint.rotatePoint.x,
          obj.verticalStartRotatePoint.rotatePoint.y,
        );
        context.arc(
          obj.verticalStartRotatePoint.rotatePoint.x,
          obj.verticalStartRotatePoint.rotatePoint.y,
          rotateDia,
          0,
          2 * Math.PI,
        );
        context.fillStyle = color;
        context.fill();

        rotateDia = obj.verticalEndRotatePoint.active ? 8 : 5;
        context.moveTo(
          obj.verticalEndRotatePoint.rotatePoint.x,
          obj.verticalEndRotatePoint.rotatePoint.y,
        );
        context.arc(
          obj.verticalEndRotatePoint.rotatePoint.x,
          obj.verticalEndRotatePoint.rotatePoint.y,
          rotateDia,
          0,
          2 * Math.PI,
        );
        context.fill();
        context.save();
      }
    }

    // 垂直层厚线
    if (obj.verticalTopSliceLine.sliceThick > 0) {
      let color = obj.verticalLine.color;
      let lineWidth = obj.verticalTopSliceLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.setLineDash([5, 8]);
      context.moveTo(obj.verticalTopSliceLine.startPoint.x, obj.verticalTopSliceLine.startPoint.y);
      context.lineTo(obj.verticalTopSliceLine.endPoint.x, obj.verticalTopSliceLine.endPoint.y);
      context.stroke();

      lineWidth = obj.verticalBottomSliceLine.active ? 2 : 1;
      context.beginPath();
      context.lineWidth = lineWidth;
      context.moveTo(
        obj.verticalBottomSliceLine.startPoint.x,
        obj.verticalBottomSliceLine.startPoint.y,
      );
      context.lineTo(
        obj.verticalBottomSliceLine.endPoint.x,
        obj.verticalBottomSliceLine.endPoint.y,
      );
      context.stroke();
      context.restore();
    }

    if (this.sliceMode) {
      context.beginPath();
      context.moveTo(
        obj.verticalTopSliceLine.startSlicePoint.x,
        obj.verticalTopSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.verticalTopSliceLine.startSlicePoint.x,
        obj.verticalTopSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.verticalTopSliceLine.startSlicePoint.x,
        obj.verticalTopSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.verticalTopSliceLine.startSlicePoint.x,
        obj.verticalTopSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.verticalTopSliceLine.endSlicePoint.x,
        obj.verticalTopSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.verticalTopSliceLine.endSlicePoint.x,
        obj.verticalTopSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.verticalTopSliceLine.endSlicePoint.x,
        obj.verticalTopSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.verticalTopSliceLine.endSlicePoint.x,
        obj.verticalTopSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.verticalBottomSliceLine.startSlicePoint.x,
        obj.verticalBottomSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.verticalBottomSliceLine.startSlicePoint.x,
        obj.verticalBottomSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.verticalBottomSliceLine.startSlicePoint.x,
        obj.verticalBottomSliceLine.startSlicePoint.y,
      );
      context.arc(
        obj.verticalBottomSliceLine.startSlicePoint.x,
        obj.verticalBottomSliceLine.startSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();

      context.moveTo(
        obj.verticalBottomSliceLine.endSlicePoint.x,
        obj.verticalBottomSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.verticalBottomSliceLine.endSlicePoint.x,
        obj.verticalBottomSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.strokeStyle = 'black';
      context.stroke();

      context.moveTo(
        obj.verticalBottomSliceLine.endSlicePoint.x,
        obj.verticalBottomSliceLine.endSlicePoint.y,
      );
      context.arc(
        obj.verticalBottomSliceLine.endSlicePoint.x,
        obj.verticalBottomSliceLine.endSlicePoint.y,
        3,
        0,
        2 * Math.PI,
      );
      context.fillStyle = 'white';
      context.fill();
    }

    // 中间方块
    if (obj.centerCircle.active) {
      let color = obj.centerCircle.color;
      let lineWidth = 2;

      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.arc(
        obj.centerCircle.point.x,
        obj.centerCircle.point.y,
        obj.circleDia,
        0,
        2 * Math.PI,
      );
      context.stroke();
    }
  };

  _onResize = (e: any) => {
    this.centerCircle.point = cornerstone.pixelToCanvas(this.element, this.centerCircle.imagePoint);
    cornerstone.updateImage(this.element);
  };

  getSliceType() {
    return this.sliceType;
  }

  setOperateLinePos(coordinate?: any, changeType?: string, index?: number) {
    if (coordinate && !_.isEmpty(coordinate)) {
      this.centerCircle.imagePoint = coordinate;
      this.centerCircle.point = cornerstone.pixelToCanvas(
        this.element,
        this.centerCircle.imagePoint,
      );
      return;
    }
    if (changeType === 'horizontalLine') {
      this.centerCircle.imagePoint.y = index;
    }
    if (changeType === 'verticalLine') {
      this.centerCircle.imagePoint.x = index;
    }
    this.centerCircle.point = cornerstone.pixelToCanvas(this.element, this.centerCircle.imagePoint);
  }

  getOperateLinePos() {
    return this.centerCircle.imagePoint;
  }

  isThisLine(element: HTMLElement) {
    if (element === this.element) {
      return true;
    }
    return false;
  }

  resetOperateLine(element: HTMLElement, enableElement: any, boundary: any) {
    // TODO 重设水平线和垂直线
    let obj = this;
    let context = enableElement.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.save();

    if (element.clientHeight === 0 && element.clientWidth === 0) {
      return;
    }

    // obj.centerCircle.point = cornerstone.pixelToCanvas(element, obj.centerCircle.imagePoint)
    // this.calculateAllPosition(element)
    if (!boundary) return;
    let width = (boundary.xMax - boundary.xMin) / 2;
    let height = (boundary.yMax - boundary.yMin) / 2;
    let centerX = boundary.xMin + width;
    let centerY = boundary.yMin + height;
    // 水平线
    {
      let color = obj.horizontalLine.color;
      let lineWidth = obj.horizontalLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.moveTo(0, centerY);
      context.lineTo(boundary.xMin, centerY);
      context.moveTo(boundary.xMax, centerY);
      context.lineTo(obj.horizontalLine.endPoint.x, centerY);
      context.stroke();
      context.save();
    }

    // 垂直线
    {
      let color = obj.verticalLine.color;
      let lineWidth = obj.verticalLine.active ? 2 : 1;

      // Draw the measurement line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.moveTo(centerX, 0);
      context.lineTo(centerX, boundary.yMin);
      context.moveTo(centerX, boundary.yMax);
      context.lineTo(centerX, obj.verticalLine.endPoint.y);
      context.stroke();
      context.save();
    }

    // 中间方块
    if (obj.centerCircle.active) {
      let color = obj.centerCircle.color;
      let lineWidth = 2;

      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.arc(
        obj.centerCircle.point.x,
        obj.centerCircle.point.y,
        obj.circleDia,
        0,
        2 * Math.PI,
      );
      context.stroke();
    }
  }

  passiveOperateLine() {
    this.element.removeEventListener(cornerstone.EVENTS.IMAGE_RENDERED, this._onImageRendered);
    this.element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_MOVE, this._mouseMoveCallback);
    this.element.removeEventListener(cornerstoneTools.EVENTS.MOUSE_DOWN, this._mouseDownCallback);
    this.element.removeEventListener(cornerstone.EVENTS.ELEMENT_RESIZED, this._onResize);
    cornerstone.updateImage(this.element);
  }
}
//************************************************************************************************************************
// wxl 左上角X坐标
// wxr 右下角X坐标
// wyt 右上角Y坐标
// wyb 右下角Y坐标
function _refreshLine(
  wxl: any,
  wxr: any,
  wyt: any,
  wyb: any,
  point: any,
  direction: any,
  theLine: any,
) {
  const minAndmax = _calLineMinMax(wxr, point, direction);
  const lineCoords = _clipLine(wxl, wxr, wyt, wyb, minAndmax.min, minAndmax.max);
  theLine.startPoint.x = direction.x > 0 ? lineCoords[0] : lineCoords[2];
  theLine.startPoint.y = direction.x > 0 ? lineCoords[1] : lineCoords[3];
  theLine.endPoint.x = direction.x > 0 ? lineCoords[2] : lineCoords[0];
  theLine.endPoint.y = direction.x > 0 ? lineCoords[3] : lineCoords[1];
}
function _calLineMinMax(width: any, point: any, direction: any) {
  const lineMin = {
    /**/ x: 0,
    y: Math.round(point.y + ((0 - point.x) * direction.y) / direction.x),
  };
  const lineMax = {
    x: width,
    y: Math.round(point.y + ((width - point.x) * direction.y) / direction.x),
  };

  return { min: lineMin, max: lineMax };
}

/**
 根据矩形裁剪直线段
 @param wxl 左上角X坐标
 @param wxr 右下角X坐标
 @param wyt 右上角Y坐标
 @param wyb 右下角Y坐标
 @param {{x: number, y: number}} start 起点
 @param {{x: number, y: number}} stop 终点
 @return  Array 坐标字符串，如'2323,4343,5454,6563'
 */
function _clipLine(wxl: any, wxr: any, wyt: any, wyb: any, start: any, stop: any) {
  let dx, dy;
  let u1 = 0;
  let u2 = 1;
  dx = stop.x - start.x;
  if (ClipTest(-dx, start.x - wxl)) {
    if (ClipTest(dx, wxr - start.x)) {
      dy = stop.y - start.y;
      if (ClipTest(-dy, start.y - wyt)) {
        if (ClipTest(dy, wyb - start.y)) {
          let arrCoords = [];
          arrCoords[0] = start.x + u1 * dx;
          arrCoords[1] = start.y + u1 * dy;
          arrCoords[2] = start.x + u2 * dx;
          arrCoords[3] = start.y + u2 * dy;
          return arrCoords;
        }
      }
    }
  }
  function ClipTest(p: any, q: any) {
    let flag = true;
    let r;
    if (p < 0.0) {
      r = q / p;
      if (r > u2) {
        flag = false;
      } else if (r > u1) {
        u1 = r;
        flag = true;
      }
    } else if (p > 0) {
      r = q / p;
      if (r < u1) {
        flag = false;
      } else if (r < u2) {
        u2 = r;
        flag = true;
      }
    } else if (q < 0) {
      flag = false;
    }
    return flag;
  }
  return [];
}

function passive() {
  for (let line of mprOperateLines) {
    line.passiveOperateLine();
  }
  mprOperateLines = [];
}

function active(element: HTMLElement, info: string) {
  let operateLine = new MprOperateLine(info);
  operateLine.init(element);
  for (let i = 0; i < mprOperateLines.length; i++) {
    if (mprOperateLines[i].isThisLine(element) && mprOperateLines[i].getSliceType() === info) {
      mprOperateLines[i].passiveOperateLine();
      mprOperateLines.splice(i, 1);
      break;
    }
  }
  mprOperateLines.push(operateLine);
}

function setMprOperateLinePos(
  sliceType: string,
  coordinate?: { x: number; y: number },
  changeType?: string,
  index?: number,
) {
  const operateLine = mprOperateLines.find((line: any) => line.getSliceType() === sliceType);
  if (operateLine) {
    let operateLinePos = operateLine.getOperateLinePos();
    if (coordinate) {
      operateLine.setOperateLinePos(coordinate);
      return;
    }
    if (changeType === 'horizontalLine') {
      if (operateLinePos.y === index) {
        return;
      }
    } else {
      if (operateLinePos.x === index) {
        return;
      }
    }
    operateLine.setOperateLinePos(changeType, index);
  }
}

function deleteOperateLine(element: HTMLElement) {
  for (let i = mprOperateLines.length - 1; i >= 0; i--) {
    if (mprOperateLines[i].isThisLine(element)) {
      mprOperateLines[i].passiveOperateLine();
      mprOperateLines.splice(i, 1);
      break;
    }
  }
}

const mprOperateLine = {
  active: active,
  passive: passive,
  setMprOperateLinePos,
  deleteOperateLine,
  mprOperateLines: mprOperateLines,
};

export default mprOperateLine;
