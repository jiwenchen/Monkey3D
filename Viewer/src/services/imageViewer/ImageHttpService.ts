import { reqGet, reqPost } from '@/services/HttpService';

export async function getVolumetype(payload: any) {
  const endpoint = `/volumetype`;
  return reqPost(endpoint, payload);
}

export async function getMprData(payload: any) {
  const endpoint = `/mprdata`;
  return reqGet(endpoint, payload);
}
