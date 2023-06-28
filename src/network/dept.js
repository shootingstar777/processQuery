import { request } from "./request";
export function getCommonGroup_(data){
  return request({
    url: '/api/yturm/wfDept/commonGroup.do',
    params:data
  })
}
export function getCommonUserJson_(data){
  return request({
    url: '/api/yturm/wfUser/commonUserJson.do',
    method:'POST',
    data:data
  })
}