<template>
  <div class="videoRecord">
    <div class="videoRecord__filter">
      <el-form
        class="videoRecord__fliterBox"
        label-width="90px"
        :inline="true"
        size="mini"
      >
        <el-form-item label="车牌">{{ vehInfo && vehInfo.P }}</el-form-item>
        <el-form-item label="时间">
          {{ timeArr.join('~') }}
          <!-- <el-date-picker
            v-model="timeArr"
            size="small"
            type="datetimerange"
            format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
            disabled
          >
          </el-date-picker> -->
        </el-form-item>
        <el-form-item label="回放方式">
          <!-- {{ backType === 0 ? '正常回放' : backType === 1 ? '快进回放' :  backType === 2 ? '关键帧快退回放' :  backType === 3 ? '关键帧播放' : '单t贞上传' }} -->
          <a-select v-model:value="backType" style="width: 145px" disabled>
            <a-select-option :value="0">正常回放</a-select-option>
            <a-select-option :value="1">快进回放</a-select-option>
            <a-select-option :value="2">关键帧快退回放</a-select-option>
            <a-select-option :value="3">关键帧播放</a-select-option>
            <a-select-option :value="4">单t贞上传</a-select-option>
          </a-select>
        </el-form-item>
        <el-form-item label="码流类型">
          <!-- {{ streamType === 0 ? '主码流' : '子码流' }} -->
          <a-select v-model:value="streamType" style="width: 85px" disabled>
            <a-select-option :value="0">主码流</a-select-option>
            <a-select-option :value="1">子码流</a-select-option>
          </a-select>
        </el-form-item>
        <el-form-item label="存储器类型">
          <!-- {{ storeType === 0 ? '主存储器或灾备存储器' : storeType === 1 ? '主存储器' : '灾备存储器' }} -->
          <a-select v-model:value="storeType" style="width: 190px" disabled>
            <a-select-option :value="0">主存储器或灾备存储器</a-select-option>
            <a-select-option :value="1">主存储器</a-select-option>
            <a-select-option :value="2">灾备存储器</a-select-option>
          </a-select>
        </el-form-item>
        <el-form-item label="音视频类型">
          <!-- {{ dataType === 0 ? '音视频' : dataType === 1 ? '音频' :  dataType === 2 ? '视频' : '音频或者视频' }} -->
          <a-select v-model:value="dataType" style="width: 130px" disabled>
            <a-select-option :value="0">音视频</a-select-option>
            <a-select-option :value="1">音频</a-select-option>
            <a-select-option :value="2">视频</a-select-option>
            <a-select-option :value="3">音频或者视频</a-select-option>
          </a-select>
        </el-form-item>
      </el-form>

      <div class="videoRecord__control">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-video-play"
          @click="commandControl(0)"
          >播放</el-button
        >
        <el-button
          type="primary"
          size="small"
          icon="el-icon-video-pause"
          @click="commandControl(1)"
          >暂停</el-button
        >
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh"
          @click="commandControl(2)"
          >停止</el-button
        >
        <el-button
          type="primary"
          size="small"
          icon="el-icon-d-arrow-right"
          @click="commandControl(3)"
          >快进</el-button
        >
        <el-button
          type="primary"
          size="small"
          icon="el-icon-d-arrow-left"
          @click="commandControl(4)"
          >快退</el-button
        >
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh-right"
          @click="commandControl(6)"
          >关键帧</el-button
        >
        <a-select v-model:value="speed" style="width: 80px; margin-left: 15px">
          <a-select-option :value="1">1倍</a-select-option>
          <a-select-option :value="2">2倍</a-select-option>
          <a-select-option :value="3">4倍</a-select-option>
          <a-select-option :value="4">8倍</a-select-option>
          <a-select-option :value="5">16倍</a-select-option>
        </a-select>
      </div>
    </div>
    <div class="videoRecord__video">
      <video
        class="videoRecord__video__source"
        poster="../../../../../../assets/img/video/bg.png"
      ></video>
      <div class="videoRecord__video__hover">
        <i
          class="iconfont icon-yinliang"
          @click="muted(index)"
          title="音量"
        ></i>
        <i
          v-if="!fullFlag"
          class="iconfont icon-quanping"
          @click="fullScreen(index)"
          title="全屏"
        ></i>
        <i
          title="取消全屏"
          v-else
          class="iconfont icon-suoxiao"
          @click="ExitFullscreen()"
        ></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { Fullscreen, ExitFullscreen, isFullscreenFn } from "@/assets/js/base";
import flvjs from "flv.js";
import API from "@/api/monitorCenter";
import { useMessage } from "@/hooks/web/useMessage";

export default defineComponent({
  props: {
    row: {
      type: Object,
      default: null,
    },
    vehInfo: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const message = useMessage();

    const data = reactive({
      /** 时间 */
      timeArr: <any[]>[],
      /** 回放方式 */
      backType: 0,
      /** 码流类型 */
      streamType: 1,
      /** 存储类型 */
      storeType: 1,
      /** 音视频类型 */
      dataType: 0,
      /** 快进或快退倍数,backType为3、4有效,0:无效,1:1倍,2:2倍,3:4倍,4:8倍,5:16倍 */
      speed: 4,

      /** 全屏flag */
      fullFlag: false,
      /** 全屏 */
      fullScreen() {
        const video = document.querySelector(".videoRecord__video") as any;
        Fullscreen(video);
      },
      setIsFullScreen() {
        data.fullFlag = isFullscreenFn();
      },

      /** 音量 */
      muted() {
        const video = document.querySelector(
          ".videoRecord__video__source"
        ) as any;

        video.muted = !video.muted;
        if (video.muted) {
          (document.querySelector(".icon-yinliang") as any).classList.replace(
            "icon-yinliang",
            "icon-yinliang-guan"
          );
        } else {
          (document.querySelector(
            ".icon-yinliang-guan"
          ) as any).classList.replace("icon-yinliang-guan", "icon-yinliang");
        }
      },
      /** flv视频实例 */
      video: <any>null,
      /** 销毁flv */
      flv_destroy(player: any) {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
        player = null;
      },
      /** 创建flv */
      flv_create() {
        const video = document.querySelector(".videoRecord__video__source");
        let devNum = props.vehInfo.N;
        devNum =
          new Array(12 - devNum.length).fill(0).join("") + props.vehInfo.N;

        data.video = flvjs.createPlayer({
          type: "flv",
          isLive: true,
          url: `${CONFIG.wsUrl}/webSocket/live?simChannel=${devNum}-1`,
        });

        data.video.attachMediaElement(video);
        try {
          data.video.load();
          data.video.play();
        } catch (error) {
          console.log(error);
        }
      },

      /** 指令下发 视频请求 */
      async command() {
        const info = {
          channelNo: 1,
          dataType: data.dataType,
          streamType: data.streamType,
          storeType: data.storeType, 
          backType: data.backType,
          speed: data.speed,
          startTime: data.timeArr[0],
          endTime: data.timeArr[1],
          commandType: "VIDEO_REPLAY",
          vehicleId: props.vehInfo.V,
        };

        const { flag, msg } = await API.replayReq(info);

        if (flag !== 1) {
          message.error(msg);
        }
      },

      /** 指令下发 视频控制 */
      async commandControl(type: number) {
        const info = {
          channelNo: 1,
          controlType: type,
          speed: data.speed,
          dropTime: 0,
          commandType: "RESOURCE_REPLAY_CONTROL",
          vehicleId: props.vehInfo.V,
        };

        const { flag, msg } = await API.replayControlReq(info);

        if (flag !== 1) {
          message.error(msg);
        }
      },
    });


    nextTick(() => {
      watch(
        () => props.row,
        (val) => {
          console.log(val);
          if (val) {
            data.timeArr = [val.startDate, val.endDate];
            data.streamType = val.streamType;
            data.dataType = val.dataType;
            data.storeType = val.storeType;

            data.flv_create();
            data.command();
          }
        },
        {
          immediate: true,
        }
      );
    });

    onMounted(() => {
      window.addEventListener("resize", data.setIsFullScreen);
    });

    // 组件销毁
    onUnmounted(() => {
      data.flv_destroy(data.video);
      window.removeEventListener("resize", data.setIsFullScreen);
    });

    return {
      ExitFullscreen,
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.videoRecord {
  display: flex;
  flex-direction: column;

  &__filter {
    padding: 5px 15px;
  }

  &__control {
    display: flex;
    align-items: center;
  }

  &__video {
    height: 400px;
    background: #000;
    position: relative;

    &:hover .videoRecord__video__hover {
      display: flex;
    }

    &__hover {
      display: none;
      height: 30px;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      background: #fff;
      opacity: 0.9;
      position: absolute;
      bottom: 0;
      z-index: 3;
    }

    .iconfont {
      cursor: pointer;
      font-size: 18px;

      &:hover {
        color: #3381e8;
      }
    }
    .icon-tingzhi:hover {
      color: red;
    }
  }

  video {
    width: 100%;
    height: 100%;
  }
}
video::-webkit-media-controls {
  display: none !important;
}
</style>
