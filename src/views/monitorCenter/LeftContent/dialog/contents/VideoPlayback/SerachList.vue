<template>
  <div class="SearchList">
    <div class="header">
      <el-form
        ref="ruleForm"
        :inline="true"
        :model="formData"
        class="demo-form-inline"
        :rules="rules"
        label-width="110px"
      >
        <el-form-item
          label="存储器里类型:"
          prop="storeType"
        >
          <el-select
            filterable
            v-model="formData.storeType"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in storageOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="音视频类型:"
          prop="dataType"
        >
          <el-select
            filterable
            v-model="formData.dataType"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in videoOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="码流类型:"
          prop="streamType"
        >
          <el-select
            filterable
            v-model="formData.streamType"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in codeStreamOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="报警标志:"
          prop="alaramStatus"
        >
          <el-select
            v-model="formData.alaramStatus"
            multiple
            clearable
            collapse-tags
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in alarmOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="查询时间时间">
          <el-col :span="12">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.startTime"
              type="datetime"
              clearable
              placeholder="暂无日期时间"
            >
            </el-date-picker>
          </el-col>
          <el-col class="line">-</el-col>
          <el-col :span="12">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              v-model="formData.endTime"
              type="datetime"
              clearable
              placeholder="暂无日期时间"
            >
            </el-date-picker>
          </el-col>
        </el-form-item>
      </el-form>
      <div class="btnBar">
        <el-button
          size="small"
          type="primary"
          @click="confirm"
          :disabled="btnFlag"
        >检索</el-button>
      </div>
    </div>
    <div class="content">
      <el-table
        max-height="400"
        size="mini"
        :data="tableData"
        style="width: 100%"
        :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
      >
        <el-table-column
          v-for="(item, index) in columns"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          align="center"
        >
          <template #default="scope">
            <template v-if="item.prop == 'play'">
              <i
                class="iconfont playBtn"
                :class="{
                  'icon-bofang1': !scope.row[item.prop],
                  'icon-zanting': scope.row[item.prop],
                }"
                @click="playVideo(scope.row)"
              ></i>
            </template>
            <span v-else>
              {{ format(item.prop, scope.row[item.prop]) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <Eldialog
    width="1000px"
    title="录像回放"
    v-model:visible="show"
  >
    <template v-slot:form>
      <VideoRecord
        :row="currentrow"
        :vehInfo="vehInfo"
      />
    </template>
  </Eldialog>
</template>
<script lang="ts">
import { useFunction } from "../../../../function";
import dayJs from "dayjs";
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  toRefs,
  watch,
} from "vue";
export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    command: {
      type: Object,
      default: () => null,
    },
    vehInfo: {
      type: Object,
      default: null,
    },
  },
  components: {
    Eldialog: defineAsyncComponent(
      () => import("@/components/Eldialog/index.vue")
    ),
    VideoRecord: defineAsyncComponent(() => import("./VideoRecord.vue")),
  },
  setup(props, { emit }) {
    const {
      replayResourceReq,
      showAMsg,
      queryResourceResponse,
    } = useFunction();
    const data = reactive({
      /** 第二层弹窗flag */
      show: false,
      currentrow: null,

      formData: {
        channelNo: 1,
        storeType: 0,
        dataType: 0,
        streamType: 0,
        alaramStatus: [0],
        startTime: dayJs(new Date()).format("YYYY-MM-DD 00:00:00"),
        endTime: dayJs(new Date()).format("YYYY-MM-DD 23:59:59"),
      },
      timer: null as any,
      second: 0,
      loading: false,
      btnFlag: false,
      ruleForm: null as any,
      columns: [
        {
          prop: "index",
          label: "序号",
        },
        {
          prop: "play",
          label: "播放",
        },
        {
          prop: "dataType",
          label: "音视频类型",
        },
        {
          prop: "storeType",
          label: "存储器类型",
        },
        {
          prop: "streamType",
          label: "码流类型",
        },
        {
          prop: "alarmStatus",
          label: "报警标志",
        },
        {
          prop: "startDate",
          label: "开始时间",
        },
        {
          prop: "endDate",
          label: "结束时间",
        },
        {
          prop: "time",
          label: "录像时长",
        },
      ],
      tableData: [],
      alarmOptionsMap: new Map(),
      alarmOptions: [
        { label: "全部", value: 0 },
        { label: "紧急报警", value: 1 },
        { label: "超速报警", value: 2 },
        { label: "TTS模块故障", value: 3 },
        { label: "摄像头故障", value: 4 },
        { label: "道路运输证 IC 卡模块故障", value: 5 },
        { label: "当天累计驾驶超时", value: 6 },
        { label: "超时停车", value: 7 },
        { label: "疲劳驾驶", value: 8 },
        { label: "进出区域", value: 9 },
        { label: "进出路线", value: 10 },
        { label: "路段行驶时间不足/过长", value: 11 },
        { label: "路线偏离报警", value: 12 },
        { label: "车辆VSS故障", value: 13 },
        { label: "车辆油量异常", value: 14 },
        { label: "车辆被盗", value: 15 },
        { label: "车辆非法点火", value: 16 },
        { label: "车辆非法位移", value: 17 },
        { label: "碰撞侧翻报警", value: 18 },
        { label: "预警", value: 19 },
        { label: "GNSS模块发生故障", value: 20 },
        { label: "GNSS天线未接", value: 21 },
        { label: "GNSS天线短路", value: 22 },
        { label: "终端主电源欠压", value: 23 },
        { label: "终端主电源掉电", value: 24 },
        { label: "视频信号丢失报警", value: 25 },
        { label: "视频信号遮挡报警", value: 26 },
        { label: "存储故障报警", value: 27 },
        { label: "其他视频设备故障报警", value: 28 },
        { label: "客车超员报警", value: 29 },
        { label: "异常驾驶行为报警", value: 30 },
        { label: "特殊报警录像达到存储阈值报警", value: 31 },
      ],
      codeStreamOptions: [
        {
          label: "所有码流",
          value: 0,
        },
        {
          label: "主码流",
          value: 1,
        },
        {
          label: "子码流",
          value: 2,
        },
      ],
      videoOptions: [
        {
          label: "音视频",
          value: 0,
        },
        {
          label: "视频",
          value: 2,
        },
        {
          label: "视频或音,视频",
          value: 3,
        },
      ],
      storageOptions: [
        {
          label: "所有存储器",
          value: 0,
        },
        {
          label: "主存储器",
          value: 1,
        },
        {
          label: "灾备存储器",
          value: 2,
        },
      ],
      submitForm: function (formName: any) {
        data.ruleForm.validate((valid: any) => {
          if (valid) {
            setTimeout(() => {
              data.btnFlag = false;
            }, 2000);
            data.sendCommand();
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      },
      resetForm: function (formName: any) {
        data.ruleForm.resetFields();
      },
      confirm() {
        data.submitForm("ruleForm");
      },
      // 下发指令
      async sendCommand() {
        if (data.btnFlag) return;
        if (
          dayJs(data.formData.endTime).isBefore(dayJs(data.formData.startTime))
        ) {
          showAMsg("结束时间不能大于开始时间");
          return;
        }
        data.resert();
        const params = {
          ...data.formData,
          alaramStatus: data.formData.alaramStatus.join(","),
          commandType: props.command && props.command.param ? props.command.param : "RESOURCE_CATALOG",
          startTime: dayJs(data.formData.startTime).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          endTime: dayJs(data.formData.endTime).format("YYYY-MM-DD HH:mm:ss"),
          commandMsg: "资源目录",
          vehicleId: props.vehInfo.V,
        };
        const { flag, msg } = (await replayResourceReq(params)) as any;
        if (flag == 1) {
          data.getList();
        } else {
          showAMsg(msg);
        }
        data.btnFlag = true;
      },
      // 获取资源列表
      async getList() {
        async function gteData() {
          const res = await queryResourceResponse({
            vehicleId: props.vehInfo.V,
          });
          if (res) {
            data.tableData = res.map((item: any, index: number) => ({
              ...item,
              index: index + 1,
              time: data.formatTime(
                dayJs(item.endDate).diff(dayJs(item.startDate), "second")
              ),
            }));
          }
        }
        gteData();
        data.timer = setInterval(async () => {
          if (data.second >= 4) {
            data.resert();
            return;
          }
          gteData();
          data.second++;
        }, 2000);
      },
      rules: {},
      alarmStatusFormat(val: any) {
        const str = val.toString();
        const arr = str.split(",");
        let resArr = [] as any;
        arr.map((item: any) => {
          resArr.push(data.alarmOptionsMap.get(parseInt(item)).label);
        });
        return resArr.join(",");
      },
      formatTime(t: any) {
        let h: any = parseInt((t / 3600) as any);
        h = h >= 1 ? h + "小时" : "";
        let m: any = parseInt(((t % 3600) / 60) as any);
        m = m >= 1 ? m + "分钟" : "";
        let s: any = parseInt((t % 60) as any);
        s = s >= 1 ? s + "秒" : "";
        return h + m + s;
      },
      format(prop: string, val: any) {
        if (["endDate", "startDate"].includes(prop)) {
          return dayJs(val).format("YYYY-MM-DD HH:mm:ss");
        } else {
          switch (prop) {
            case "alarmStatus":
              return data.alarmStatusFormat(val);
              break;
            case "dataType":
              if (val == 0) {
                return "音视频";
              } else if (val == 2) {
                return "视频";
              } else {
                return "视频或音,视频";
              }
              break;
            // case "fileLength":
            //   return data.formatTime(dayJs(val).unix());
            //   break;
            case "storeType":
              if (val == 0) {
                return "所有存储器";
              } else if (val == 1) {
                return "主存储器";
              } else {
                return "灾备存储器";
              }
              break;
            case "streamType":
              if (val == 0) {
                return "所有码流";
              } else if (val == 1) {
                return "主码流";
              } else {
                return "子码流";
              }
              break;
            default:
              return val;
              break;
          }
        }
      },
      resert() {
        window.clearInterval(data.timer);
        data.timer = null;
        data.second = 0;
      },
      playVideo(row: any) {
        data.show = true;
        data.currentrow = row;
      },
    });
    nextTick(() => {
      watch(
        () => props.visible,
        (val) => {
          if (!val) {
            data.resetForm("ruleForm");
            data.resert();
            data.tableData = [];
          } else {
            data.alarmOptions.map((item) => {
              data.alarmOptionsMap.set(item.value, item);
            });
          }
        },
        {
          immediate: true,
        }
      );
    });
    return {
      ...toRefs(props),
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.SearchList {
  padding: 16px;
  .header {
    .btnBar {
      height: 40px;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 12px;
    }
  }
  .content {
    padding: 10px;
    max-height: 420px;
    width: 100%;
  }

  ::v-deep(.el-form--inline) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  ::v-deep(.el-input__inner),
  ::v-deep(.el-date-editor) {
    width: 270px;
    height: 40px;
    border-radius: 0;
  }
  ::v-deep(.el-select__tags) {
    // 用于解决多选框换行问题
    .el-select__input {
      max-width: 50px !important;
    }
  }
  ::v-deep(.el-form-item__label) {
    text-align: right;
  }
}
.playBtn {
  cursor: pointer;
  &:hover {
    color: blue;
  }
}
</style>