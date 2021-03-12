// 自定义续费类型
export enum customRechargeTypeEnum {
  CUSTOM_NO_RECHARGE = 2,                     // 自定义不续费
  CUSTOM_RECHARGE = 1,                        // 自定义续费
  CUSTOM_NO_RECHARGE_OUT = 0,                 // 自定义不续费转出
}

// 车辆转移类型
export enum carMoveModalTypeEnum {
  TABLE = 'table',                            // 表格数据
  ALL = 'all',                                // 车辆转移
  SELECT = 'select'                           // 转移选中项
}

// 车辆续费类型
export enum carRechargeTypeEnum {
  NORMAL = 'normal',                          // 正常
  IMPORT = 'import',                          // 导入
}

// 弹窗显示类型
export enum modalTypeEnum {
  ADD = 'add',                                // 添加
  EDIT = 'edit',                              // 修改
}

// 工单管理类型
export enum carWorkSheetModalTypeEnum {
  ADD = 'add',                                // 添加
  EDIT = 'edit',                              // 修改
  SHOW = 'show',                              // 查看
}

// 用户表单类型
export enum userInfoModalTypeEnum {
  ADD = 'add',                                // 添加
  EDIT = 'edit',                              // 修改
  ADDPARENT = 'addParent',                    // 添加下级
}

// 树类型
export enum treeTypeEnum {
  USER = 'corpName',                          // 用户树
  GROUP = 'gn',                               // 车组树
}

// 树功能类型
export enum treeSettingTypeEnum {
  ADD = 'add',                                // 添加
  EDIT = 'edit',                              // 修改
  DELETE = 'delete',                          // 删除
  EDITINFO = 'editInfo',                      // 其他
}

// 续费类型
export enum renewEnum {
  YES = 0,                                    // 续费
  NO = 1                                      // 不续费 
}

// 选择日期类型
export enum selectDateTypeEnum {
  DATE = 'date',                              // 日期
  DAY = 'day',                                // 天
  DAYCUSTOM = 'dayCustom',                    // 自定义
  ALL = 'all',                                // 所有功能
}