<template>
  <div class="content">
    <!-- 头部功能  -->
    <div class="content__header">
      <div class="content__header__left">
        <a-button v-permission="160206" type="primary" @click="carMove(carMoveModalTypeEnum.ALL)">车辆转移</a-button>
        <a-button v-permission="160205" type="primary" @click="carMove(carMoveModalTypeEnum3.SELECT)">转移选中项</a-button>
        <a-button v-permission="160207" type="primary" @click="customDelete()">自定义删除</a-button>
      </div>
      <div class="content__header__right">
        <a-button v-permission="160211" @click="onExport">
          <template #icon><i :class="['iconfont', 'icon', 'icon-daochu']"></i></template>
          导出
        </a-button>
      </div>
    </div>
    <!-- 车辆功能 -->
    <div class="content__body">
      <!-- 车辆树 -->
      <div class="content__left">
        <CarTree></CarTree>
      </div>
      <!-- 车辆表格 -->
      <div class="content__table">
        <CarTable ref="carTableRef" :selectTreeDataProvide="selectTreeDataProvide" @moveCar="carMove" @selectionChange="selectionChange"></CarTable>
      </div>
    </div>
    <!-- 车辆转移 -->
    <CarMoveModal
    v-bind="$attrs" 
    v-model:visible="carMoveModalVisible" 
    @carMoveModalHandleOk="carMoveModalHandleOk" 
    v-model:dataItem="carMoveDataItem" 
    :modalType="modalType"></CarMoveModal>
    <!-- 自定义删除 -->
    <CarDeleteCustomModal 
    v-bind="$attrs"
    v-model:visible="carDeleteCustomModalVisible"
    @carDeleteCustomModalHandleOK="carDeleteCustomModalHandleOK"
    ></CarDeleteCustomModal>
    <!-- 自定义删除  提交数据成功后 显示结果的表格 -->
    <CarCustomNoRechargeOkModal
    v-bind="$attrs"
    v-model:visible="carCustomNoRechargeOkVisible"
    :item="carDeleteCustomOkRes"
    ></CarCustomNoRechargeOkModal>
  </div>
</template>
<script lang="ts">
import { defineComponent,toRefs,provide,reactive,Ref,inject } from "vue";
import CarTree from "./components/Tree.vue";
import CarTable from "./components/Table.vue";
import { ElMessage } from 'element-plus';
import API from "@/api/manageData";
import { CarCustomNoRechargeOkModal,CarDeleteCustomModal,CarMoveModal } from "@/views/manageData/module/index";
import { carMoveModalTypeEnum } from '@/enums/manageDataEnum';
export default defineComponent({
  components: {
    CarTree,
    CarCustomNoRechargeOkModal,
    CarTable,
    CarDeleteCustomModal,
    CarMoveModal
  },
  setup() {
    const data = reactive({
      modalType: '',                               // 车辆转移类型
      carMoveDataItem: {                              // 转移车辆信息
        terminalNo: '',                               // 终端号
        vehicleId: '',                                // 车辆ID
        groupId: <any>'',                             // 车组ID
        list: ''                                      // 批量设备好 英文逗号隔开
      },
      carDeleteCustomModalVisible: false,             // 自定义删除窗口显示状态
      carMoveModalVisible: false,                     // 车辆转移窗口显示状态
      selectionChangeValue: [],                       // 表格多选数组
      carTableRef: <any>null,                         // 表格REF
      carDeleteCustomOkRes: null,                     // 自定义删除成功回调
      carCustomNoRechargeOkVisible: false,            // 自定义删除后显示成功数据窗口显示状态
      selectTreeDataProvide: <any>{},                 // 左侧树形 选择的车辆数据
      carMoveModalTypeEnum
    });

    // 表格勾选车辆回调方法
    const selectionChange = (item:any) =>{
      data.selectionChangeValue = item;
    }
    // 自定义显示功能
    const customDelete = () => {
      data.carDeleteCustomModalVisible = true;
    }
    // 车辆转移
    const carMove = (type:string, item:any=null) => {
      data.modalType = type;
      //判断是否有选择数据
      if(data.modalType === carMoveModalTypeEnum.SELECT && data.selectionChangeValue.length === 0){
        ElMessage.error('请勾选车辆');
        return false;
      }
      if(item === null){
        let ids = '';
        data.selectionChangeValue.forEach((item:any)=>{
          ids += item.terminalNo + ','
        });
        data.carMoveDataItem = {
          terminalNo: '',
          vehicleId: '',
          groupId: '',
          list: ids.substring(0,ids.length-1),
        }
      }else{
        data.carMoveDataItem = {
          terminalNo: item.terminalNo,
          vehicleId: item.vehicleId,
          groupId: data.selectTreeDataProvide.gi,
          list: '',
        }
      }
      data.carMoveModalVisible = true;
    }
    // 车辆转移提交成功回调
    const carMoveModalHandleOk = () => {
      setTimeout(()=>{
        data.carTableRef.getData();
      },500)
    }
    // 自定义删除提交成功返回值
    const carDeleteCustomModalHandleOK = (obj: any) => {
      data.carDeleteCustomOkRes = obj;
      data.carCustomNoRechargeOkVisible = true;
    }

    // 更新车辆表格
    const updateSelectTreeData = (val: any) => {
      data.selectTreeDataProvide = val;
    };
    provide("updateSelectTreeData", updateSelectTreeData);
    const navModal = <Ref<(val: string) => void>>inject("navModal");

    // 导出数据
    const onExport = async () =>{
      try {
        if(!(data.selectTreeDataProvide && data.selectTreeDataProvide.gi)) throw '请选择车组';
        const { flag, msg } = await API.exportVehicleByGroupRds({groupId:data.selectTreeDataProvide.gi});
        if (flag === 0) throw msg;
        navModal.value("download");
      } catch (error) {
        ElMessage.error(error);
      }
    }

    return {
      onExport,
      carMove,
      carDeleteCustomModalHandleOK,
      carMoveModalHandleOk,
      customDelete,
      selectionChange,
      ...toRefs(data)
    };
  },
});
</script>
<style lang="less" scoped>
.content{
  height: 100%;
  width: 100%;
  font-size:12px;
  background-color: white;
  display: flex;
  flex-direction: column;
  &__header{
    width: 100%;
    height: 51px;
    line-height: 51px;
    display: flex;
    padding: 0 16px;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7eb;
    button{
      margin-right: 15px;
    }
  }
  &__body{
    display: flex;
    flex:1;
    height: calc(100% - 51px);
    justify-content: space-between;
    .content__left{
      width: 300px;
      border: 1px solid #e4e7eb;
      border-top:0px;
      overflow-y: auto;
    }
    .content__table{
      width: calc(100% - 300px);
      height: 100%; 
      flex:1;
    }
  }
}

</style>