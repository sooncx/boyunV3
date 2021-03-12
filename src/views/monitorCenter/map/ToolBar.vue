<template>
  <div
    class="ToolBar"
    :class="{ showVideo: videoFlag }"
  >
    <div class="ToolBar__content">
      <div
        class="left"
        :title="selectedVeh && address"
      >
        {{ selectedVeh && address }}
      </div>
      <div class="right">
        <div class="right__button">
          <a-select
            v-model:value="defaultType"
            style="width: 100px"
            size="small"
          >
            <a-select-option
              v-for="item in type"
              :key="item"
            >
              {{ item }}
            </a-select-option>
          </a-select>
        </div>
        <div
          class="right__items"
          :style="{
            width: !videoFlag ? '350px' : switcFlag ? '390px' : '220px',
          }"
        >
          <template v-if="!videoFlag || switcFlag">
            <a-tooltip placement="bottom">
              <template #title>
                <span>{{ Satellite ? "卫星地图关" : "卫星地图开" }}</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('卫星地图')"
              >
                <i
                  class="iconfont icon icon-weixingyuntu"
                  :style="{ color: Satellite ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>{{ Traffic ? "路况图关" : "路况图开" }}</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('路况图')"
              >
                <i
                  class="iconfont icon icon-hongludeng"
                  :style="{ color: Traffic ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>{{ Cluster ? "聚合关" : "聚合开" }}</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('聚合')"
              >
                <i
                  class="iconfont icon icon-juji"
                  :style="{ color: Cluster ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>区域查车</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('区域查车')"
              >
                <i class="iconfont icon icon-quyuguanli"></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>测距</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('测距')"
              >
                <i class="iconfont icon icon-chizi"></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>位置点</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('位置点')"
              >
                <i
                  class="iconfont icon icon-weizhidian"
                  :style="{
                    color:
                      slideBoxType == '位置点' && slideBoxShow ? 'blue' : '',
                  }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>围栏</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('围栏')"
              >
                <i
                  class="iconfont icon icon-langan"
                  :style="{
                    color: slideBoxType == '围栏' && slideBoxShow ? 'blue' : '',
                  }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>二押点</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('二押点')"
              >
                <i
                  class="iconfont icon icon-weizhi"
                  :style="{
                    color:
                      slideBoxType == '二押点' && slideBoxShow ? 'blue' : '',
                  }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip
              placement="bottom"
              v-if="hasOcar"
            >
              <template #title>
                <span>Ocar出入库</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('Ocar出入库')"
              >
                <i class="iconfont icon icon-churuku"></i>
              </div>
            </a-tooltip>
          </template>
          <template v-else>
            <a-tooltip placement="bottom">
              <template #title>
                <span>关闭直播</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('关闭直播')"
              >
                <i class="iconfont icon icon-guanbichuangkou"></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>一宫格</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('一宫格')"
              >
                <i
                  class="iconfont icon icon-yigongge"
                  :style="{ color: videoNum === 1 ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>四宫格</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('四宫格')"
              >
                <i
                  class="iconfont icon icon-sigongge"
                  :style="{ color: videoNum === 4 ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>六宫格</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('六宫格')"
              >
                <i
                  class="iconfont icon icon-gongge2"
                  :style="{ color: videoNum === 6 ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template #title>
                <span>八宫格</span>
              </template>
              <div
                class="iconBox"
                @click="toolBarFn('八宫格')"
              >
                <i
                  class="iconfont icon icon-gongge3"
                  :style="{ color: videoNum === 8 ? 'blue' : '' }"
                ></i>
              </div>
            </a-tooltip>
          </template>
          <a-tooltip
            placement="bottom"
            v-if="videoFlag&&!tipsFlag"
          >
            <template #title>
              <span>视频布局</span>
            </template>
            <div
              class="iconBox"
              id="switchVideo"
              @click="toolBarFn('视频布局')"
            >
              <i class="iconfont icon icon-weibiaoti-"></i>
            </div>
          </a-tooltip>
          <div v-if="videoFlag&&tipsFlag" class="iconBox" id="switchVideo" @click="toolBarFn('视频布局')">
            <i class="iconfont icon icon-weibiaoti-"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
  <OcarDialog v-model:visible="OcarVisible" />
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  inject,
  computed,
  Ref,
  ref,
  nextTick,
  defineAsyncComponent,
} from "vue";
import { useFunction } from "../function";
import { useStore } from "vuex";
import Driver from "driver.js";
import { debounce } from "@/assets/js/base";

export default defineComponent({
  components: {
    OcarDialog: defineAsyncComponent(() => import("./dialog/Ocar.vue")),
  },
  props: {
    selectedVeh: {
      type: Object,
      default: null,
    },
    id: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const videoNum = <Ref<number>>inject("videoNum");
    const updateVideoNum = inject("updateVideoNum") as Function;
    const videoFlag = <Ref<boolean>>inject("videoFlag");
    const slideBoxShow = inject("slideBoxShow") as any; // 围栏/位置点/二押点侧边栏visible
    const updateSlideBoxShow = inject("updateSlideBoxShow") as Function;
    const hasOcar = computed(() => {
      if (!store.state.vehTypes) {
        return false;
      }
      const res = store.state.vehTypes.filter((item: any) => {
        return item.typemap == "OCAR-3";
      });
      return res && res[0] && res[0].typemap == "OCAR-3" ? true : false;
    });
    const {
      getAddress,
      getArea,
      GetTwoChargeByUserId,
      SelectPointByUserId,
      showAMsg,
    } = useFunction();
    const mapType = inject("mapType") as any;
    const Cluster = inject("Cluster") as any;
    const updateMapType = inject("updateMapType") as Function;
    const updateCluster = inject("updateCluster") as any;
    const Satellite = inject("Satellite") as any;
    const updateSatellite = inject("updateSatellite") as Function;
    const Traffic = inject("Traffic") as any;
    const updateTraffic = inject("updateTraffic") as Function;
    const updateSlideBoxData = inject("updateSlideBoxData") as Function;
    const slideBoxType = inject("slideBoxType") as any;
    const updateSlideBoxType = inject("updateSlideBoxType") as Function;
    const nowMapRef = inject("nowMapRef") as any;
    const ToolData = reactive({
      type: ["百度地图", "高德地图"],
      defaultType: (mapType.value as any) == "Bmap" ? "百度地图" : "高德地图",
      address: "",
      switcFlag: true,
      OcarVisible: false, // ocar出入库弹窗visible
    });
    nextTick(() => {
      watch(
        () => ToolData.defaultType,
        (newVal, oldVal) => {
          const type = newVal == "百度地图" ? "Bmap" : "Amap";
          updateMapType(type);
        }
      );
      watch(mapType, () => {
        setTimeout(() => {
          resert();
        }, 100);
      });
      watch(
        () => props.selectedVeh,
        async (val) => {
          if (!val) return;
          const res = await getAddress([
            {
              lat: val.Y,
              lng: val.X,
            },
          ]);
          if (res && res[0] && res[0].address) {
            ToolData.address = [val.P, res[0].address].join(" : ");
          } else {
            ToolData.address = [val.P, "暂无地址"].join(" : ");
          }
        },
        {
          immediate: true,
        }
      );
    });
    function resert() {
      updateSlideBoxType("");
      updateSlideBoxShow(false);
    }
    function openSlideBox(type: string) {
      if (!slideBoxShow.value) {
        updateSlideBoxShow(true);
      } else if (slideBoxType.value == type) {
        updateSlideBoxShow(false);
      }
      updateSlideBoxType(type);
    }
    function toolBarFn(type: string) {
      let slideBoxRes = null as any;
      switch (type) {
        case "卫星地图":
          updateSatellite(!Satellite.value);
          break;
        case "路况图":
          updateTraffic(!Traffic.value);
          break;
        case "聚合":
          updateCluster(!Cluster.value);
          break;
        case "围栏":
          openSlideBox(type);
          slideBoxRes = [];
          updateSlideBoxData(slideBoxRes);
          updateSlideBoxType(type);
          setTimeout(async () => {
            if (slideBoxShow.value) {
              slideBoxRes = await getArea();
              updateSlideBoxData(slideBoxRes);
              nowMapRef.value.drawAllFences(slideBoxRes as any);
            } else {
              nowMapRef.value.clearAllFences();
            }
          }, 200);
          break;
        case "二押点":
          openSlideBox(type);
          slideBoxRes = [];
          updateSlideBoxData(slideBoxRes);
          updateSlideBoxType(type);
          setTimeout(async () => {
            if (slideBoxShow.value) {
              slideBoxRes = await GetTwoChargeByUserId();
              updateSlideBoxData(slideBoxRes);
            } else {
              nowMapRef.value.clearAllTwoChargePoints();
            }
          }, 200);

          break;
        case "位置点":
          openSlideBox(type);
          slideBoxRes = [];
          updateSlideBoxData(slideBoxRes);
          updateSlideBoxType(type);
          setTimeout(async () => {
            if (slideBoxShow.value) {
              slideBoxRes = await SelectPointByUserId();
              updateSlideBoxData(slideBoxRes);
              nowMapRef.value.drawAllPoints(slideBoxRes as any);
            } else {
              nowMapRef.value.clearAllPoints();
            }
          }, 200);
          break;
        case "测距":
          nowMapRef.value.getDistance(true);
          debounce(() => {
            showAMsg("在地图上单击鼠标左键开始测距，双击结束测距。");
          }, 300);
          break;
        case "区域查车":
          nowMapRef.value.drawRectangle("区域查车");
          debounce(() => {
            showAMsg("在地图上按住鼠标左键拖动绘制矩形。");
          }, 300);
          break;
        case "Ocar出入库":
          ToolData.OcarVisible = true;
          break;
        case "视频布局":
          ToolData.switcFlag = !ToolData.switcFlag;
          break;
        case "关闭直播":
          videoFlag.value = false;
          break;
        case "一宫格":
          updateVideoNum(1);
          break;
        case "四宫格":
          updateVideoNum(4);
          break;
        case "六宫格":
          updateVideoNum(6);
          break;
        case "八宫格":
          updateVideoNum(8);
          break;
        default:
          break;
      }
    }
    const tipsFlag = ref(false);
    const driver = new Driver({
      className: "scoped-class",
      animate: true,
      opacity: 0.75,
      padding: 5,
      allowClose: false,
      closeBtnText: "朕知道了",
      onDeselected: () => {
        tipsFlag.value = false;
        localStorage.setItem('isVideoFirst', '否');
      },
    });
    watch(
      videoFlag,
      (val) => {
        ToolData.switcFlag = false;
        if (val && props.id == "mon" && !localStorage.getItem('isVideoFirst')) {
          tipsFlag.value = true;
          setTimeout(() => {
            driver.highlight({
              element: "#switchVideo",
              popover: {
                title: "提示",
                description: "直播布局和直播关闭控制",
                position: "left",
              },
            });
          }, 500);
        }
      },
      {
        immediate: true,
      }
    );
    return {
      toolBarFn,
      Cluster,
      hasOcar,
      videoFlag,
      videoNum,
      slideBoxShow,
      tipsFlag,
      Satellite,
      Traffic,
      slideBoxType,
      ...toRefs(props),
      ...toRefs(ToolData),
    };
  },
});
</script>
<style lang="less" scoped>
.ToolBar {
  position: absolute;
  top: 10px;
  z-index: 9;
  width: 100%;
  height: 46px;
  background: transparent;
  padding: 0 10px;

  &.showVideo {
    padding: 0;
    top: 0;
  }

  &__content {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    background: #fff;
    box-shadow: 0 1px 10px 1px rgba(0, 0, 0, 0.129);
    .left {
      color: #999;
      line-height: 46px;
      padding: 0 10px;
      flex: 1;
      min-width: 150px;
      height: 100%;
      overflow: hidden; /*超出部分隐藏*/
      text-overflow: ellipsis; /* 超出部分显示省略号 */
      white-space: nowrap; /*规定段落中的文本不进行换行 */
      font-size: 14px;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 500px;
      height: 100%;
      &__button {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        margin-right: 20px;
      }
      &__items {
        width: 350px;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
  }
}
.iconBox {
  width: 27px;
  height: 27px;
  // box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.336);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1px;
  cursor: pointer;
  color: gray;
  &:hover {
    i {
      color: blue;
    }
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.15);
  }
}
::v-deep(.ant-select-single:not(.ant-select-customize-input)
    .ant-select-selector) {
  border-radius: 20px;
  border-color: #bbc6d3;
}
::v-deep(.ant-select-focused:not(.ant-select-disabled).ant-select-single:not(.ant-select-customize-input)
    .ant-select-selector) {
  box-shadow: none;
  border-color: #bbc6d3;
}
</style>