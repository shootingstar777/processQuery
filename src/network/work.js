import {
  request
} from "./request";
export function getDataGridList_(data) {
  return request({
    url: '/api/yturm/ytbpm/workFlowQuery/dataGridList.do',
    params: data
  })
}