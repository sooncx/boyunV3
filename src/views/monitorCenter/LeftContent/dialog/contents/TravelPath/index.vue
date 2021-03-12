<template>
  <div class="TravelPath">
    <div class="TravelPath_left">
      <div class="header">
        <!-- <span> 选择时间</span> -->
        <el-date-picker
          v-model="startTime"
          type="datetime"
          placeholder="开始时间"
        >
        </el-date-picker>
        <el-date-picker
          v-model="endTime"
          type="datetime"
          placeholder="结束时间"
        >
        </el-date-picker>
        <el-button
          type="primary"
          size="mini"
          @click="getTraceData()"
        >搜索</el-button>
      </div>
      <div class="content">
        <el-table
          max-height="550"
          height="550"
          size="mini"
          :data="tableData"
          style="width: 100%"
          :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        >
          <el-table-column
            v-for="(item,index) in columns"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :fixed="item.fixed"
            :min-width="item.width"
            align="center"
          >
            <template #default="scope">
              <template v-if="item.prop == 'play'">
                <i
                  class="iconfont icon-guiji"
                  :style="{color:playIng && playIng.index == scope.row.index?'blue':''}"
                  @click="playTrace(scope.row)"
                ></i>
              </template>
              <span v-else>
                {{ format( item.prop, scope.row[item.prop]) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="TravelPath_right">
      <div
        ref="TravelPathMapRef"
        style="height:100%;width:100%"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
import dayJs from "dayjs";
import { useAmap } from "@/views/monitorCenter/map/Amap";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
  Ref,
  watchEffect,
} from "vue";
import { useFunction } from "../../../../function";
import API from "@/api/dataReport";
import PAPI from "@/api/playBack";
import { GetGeo } from "@/api/apiFn";
export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    vehInfo: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { showAMsg } = useFunction();
    const TravelPathMapRef = ref<HTMLDivElement | null>(null);
    let AmapObj = null as any;
    const data = reactive({
      tableData: [] as any,
      startTime: dayJs(dayJs(new Date()).subtract(7, "day")).format(
        "YYYY-MM-DD 00:00:00"
      ),
      endTime: dayJs(new Date()).format("YYYY-MM-DD 23:59:59"),
      playIng: null as any,
      columns: [
        {
          prop: "index",
          label: "序号",
          fixed: true,
          width: 70,
        },
        {
          prop: "play",
          label: "显示轨迹",
          width: 70,
        },
        {
          prop: "plate",
          label: "车牌号",
          width: 120,
        },
        {
          prop: "accBeginTime",
          label: "开始时间",
          width: 150,
        },
        {
          prop: "accEndTime",
          label: "结束时间",
          width: 150,
        },
        {
          prop: "accSpaceTime",
          label: "轨迹时长",
          width: 150,
        },
        {
          prop: "startAddress",
          label: "起点地址",
          width: 200,
        },
        {
          prop: "endAddress",
          label: "终点地址",
          width: 200,
        },
      ],
      format(prop: string, data: any) {
        if (["startTime", "endTime"].includes(prop)) {
          return dayJs(data).format("YYYY-MM-DD HH:mm:ss");
        }
        return data || "--";
      },
      initMap() {
        AmapObj = useAmap(TravelPathMapRef as Ref<HTMLDivElement>);
        // 初始化地图
        AmapObj.initMap();
      },
      resert() {
        data.playIng = null;
        data.startTime = dayJs(dayJs(new Date()).subtract(7, "day")).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        data.endTime = dayJs(new Date()).format("YYYY-MM-DD HH:mm:ss");
        data.tableData = [];
      },
      async playTrace(val: any) {
        data.playIng = val;
        data.getTraceDetail(val);
      },
      async getTraceData() {
        if (!data.startTime || !data.endTime) {
          showAMsg("请输入开始和结束时间");
          return;
        }
        data.tableData = [];
        const params = {
          vehicleId: props.vehInfo.V,
          accBeginTime: dayJs(data.startTime as any).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          accEndTime: dayJs(data.endTime as any).format("YYYY-MM-DD HH:mm:ss"),
          accState: 0,
          pageNumber: 1,
          pageSize: 9999999,
        };
        const { flag, obj, msg } = await API.pageAccDetail(params);
        if (flag == 1 && obj) {
          data.tableData = obj.data;
          let localData = obj.data.map((item, index) => [
            {
              lat: item.latBegin,
              lon: item.lonBegin,
              tag: 2 * index,
            },
            {
              lat: item.latEnd,
              lon: item.lonEnd,
              tag: 2 * index + 1,
            },
          ]);
          let arr = [];
          for (let i in localData) {
            arr.push(localData[i][0]);
            arr.push(localData[i][1]);
          }
          let addressList = await GetGeo(arr);
          addressList = addressList.sort((a: any, b: any) => {
            return a.tag - b.tag;
          });
          // for (let i = 0; i < localData.length; i++) {
          //   (data.tableData[i].startAddress = addressList[2 * i].address),
          //     (data.tableData[i].endAddress = addressList[2 * i + 1].address);
          // }
          data.tableData = obj.data.map((item, index) => ({
            ...item,
            startAddress: addressList[2 * index].address,
            endAddress: addressList[2 * index + 1].address,
            index: index + 1,
          }));
        } else {
          showAMsg(msg);
        }
      },
      async getTraceDetail(val: any) {
        const params = {
          plate: val.plate,
          vehicleId: props.vehInfo.V,
          beginTime: dayJs(val.accBeginTime as any).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          endTime: dayJs(val.accEndTime as any).format("YYYY-MM-DD HH:mm:ss"),
          filterTime: 0,
        };
        const { obj, flag, msg } = await PAPI.listVehTrackPoint(params);
        if (flag == 1 && obj) {
          if (
            !obj.data ||
            !obj.data.trackList ||
            obj.data.trackList.length == 0
          ) {
            showAMsg("无轨迹数据");
          }
          let list = [] as any;
          obj.data.trackList.map((item) => {
            list.push({
              lat: item.a,
              lng: item.o,
            });
          });
          AmapObj.DrawTracePath(list);
        } else {
          showAMsg(msg);
        }
      },
    });
    nextTick(() => {
      watch(
        () => props.visible,
        async (val) => {
          if (val) {
            data.initMap();
          } else {
            data.resert();
          }
        },
        {
          immediate: true,
        }
      );
    });
    return {
      TravelPathMapRef,
      ...toRefs(props),
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.TravelPath {
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex: 1;
  &_left {
    width: 50%;
    height: 100%;
    border-right: 1px solid #e4e7eb;
    display: flex;
    flex-direction: column;
    .header {
      height: 50px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      span {
        padding: 0 10px 0 0;
      }
      ::v-deep(.el-input) {
        width: 200px;
      }
      ::v-deep(.el-input__inner) {
        width: 200px;
        height: 30px;
      }
      ::v-deep(.el-button--mini) {
        border-radius: 0;
      }
    }
    .content {
      flex: 1;
      .icon-guiji {
        cursor: pointer;
        color: rgb(87, 163, 250);
        &:hover {
          color: blue;
        }
      }
    }
  }
  &_right {
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #fff;
  }
}
</style>