import { reqGet, reqPost } from '@/services/HttpService';

export async function getVolumetype(payload: any) {
  const endpoint = `/volumetype`;
  return reqPost(endpoint, payload);
}
export async function initServer(payload: any) {
  const endpoint = `/initserver`;
  return reqGet(endpoint, payload);
}

export async function getMprData(payload: any) {
  const endpoint = `/mprdata`;
  return reqGet(endpoint, payload);
}

export async function mprBrowse(payload: any) {
  const endpoint = `/mprbrowse`;
  return reqGet(endpoint, payload);
}

export async function getVrData(payload: any) {
  const endpoint = `/vrdata`;
  return reqGet(endpoint);
}

export async function panMpr(payload: any) {
  const endpoint = `/panch`;
  return reqGet(endpoint, payload);
}

export async function rotatech(payload: any) {
  const endpoint = `/rotatech`;
  return reqGet(endpoint, payload);
}

export async function zoomVr(payload: any) {
  const endpoint = `/zoomvr`;
  return reqGet(endpoint, payload);
}

export async function panVr(payload: any) {
  const endpoint = `/panvr`;
  return reqGet(endpoint, payload);
}

export async function wwwlVr(payload: any) {
  const endpoint = `/wwwl`;
  return reqGet(endpoint, payload);
}

export async function resetVr(payload: any) {
  const endpoint = `/reset`;
  return reqGet(endpoint, payload);
}

export async function rotateVr(payload: any) {
  const endpoint = `/rotatevr`;
  return reqGet(endpoint, payload);
}

export async function setVrSize(payload: any) {
  const endpoint = `/setvrsize`;
  return reqGet(endpoint, payload);
}

export async function setRenderType(payload: any) {
  const endpoint = `/setrendertype`;
  return reqGet(endpoint, payload);
}

export async function getOrientation(payload: any) {
  const endpoint = `/orientation`;
  return reqGet(endpoint, payload);
}
export async function setThickness(payload: any) {
  const endpoint = `/setthickness`;
  return reqGet(endpoint, payload);
}
export async function releaseServer(payload: any) {
  const endpoint = `/releaseserver`;
  return reqGet(endpoint, payload);
}
