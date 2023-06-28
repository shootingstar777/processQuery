import {
  request
} from "./request";
export function getProcessTree_(data) {
  return request({
    url: '/api/yturm/workFlowQuery/processTree.do',
    params: data
  })
}
