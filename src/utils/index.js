import _ from 'lodash'

export const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields)
}

export const deleteFiled = ({ object = {}, fields = [] }) => {
  return _.omit(object, fields)
}