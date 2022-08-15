interface image3DStateType {
  imageData: {
    plane_type_vr: any;
    plane_type_coronal: any;
    plane_type_sagittal: any;
    plane_type_axial: any;
  };
}

interface viewport3DStateType {
  layout: number[];
  currentViewPort: any;
  usToolsState: any;
}
