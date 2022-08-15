//禁用右键
window.oncontextmenu = function (e: any) {
  return e.target.id === 'search_search';
};
