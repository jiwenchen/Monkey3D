//生成layout数组（布局）
//[{i:'1', x: 0, y: 0, w: 1: h: 1}]
//x,y 坐标，w,h宽高
export const generateLayout = (rows: any, cols: any) => {
  const res = [];
  let count = 0;
  for (let i = 0; i < rows; i++) {
    let item: any = { y: i };
    for (let j = 0; j < cols; j++) {
      item = { ...item, x: j, i: `${count++}`, w: 1, h: 1 };
      res.push(item);
    }
  }
  return res;
};

//特殊布局从第first个单元格开始，到第end个结束单元格
export const generateSpecialLayout = (rows: any, cols: any, first: any, end: any) => {
  const layout = generateLayout(rows, cols); //常规布局
  const firstItem = layout[first];
  const endItem = layout[end];
  const indexList: any = [];
  const finalLayout: any = [];
  if (firstItem && endItem && firstItem.x <= endItem.x) {
    if (firstItem.x === endItem.x && firstItem.y === endItem.y) {
      return layout;
    }
    //取出layout中在合并范围的单元格indexList = ['1','2']
    layout.forEach((item: any) => {
      if (
        item.x >= firstItem.x &&
        item.x <= endItem.x &&
        item.y >= firstItem.y &&
        item.y <= endItem.y
      ) {
        indexList.push(item.i);
      }
    });

    //indexList中单元格合并后的单元格obj
    const obj = JSON.parse(JSON.stringify(firstItem));
    obj.w = endItem.x - firstItem.x + 1;
    obj.h = endItem.y - firstItem.y + 1;
    layout.splice(first, 1, obj);

    //去除layout中参与合并的单元格
    indexList.shift();
    layout.forEach((item: any) => {
      if (!indexList.includes(item.i)) {
        finalLayout.push(item);
      }
    });

    return finalLayout;
  }
  return layout;
};
