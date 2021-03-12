<template>
  <ul
    class="tachograph"
    :class="`gongge${vehInfoList.length}`"
    v-if="visible"
  >
    <li
      v-for="(item, index) in vehInfoList"
      :key="index"
      class="player"
      :class="`item-${index + 1}`"
    >
      <video
        class="video__source"
        poster="../../assets/img/video/bg.png"
      ></video>
      <div class="startBtn">
        <i
          class="el-icon-video-play"
          @click="startPlay($event, index)"
        ></i>
      </div>

      <div class="tachograph__hover">
        <h4 :title="item.P">
          {{ item.P }}
        </h4>
        <div class="tachograph__hover__control">
          <i
            class="iconfont icon-tingzhi"
            @click="pause(index)"
          ></i>
          <i
            class="iconfont icon-icon-"
            @click="capture(index)"
          ></i>
          <i
            class="iconfont icon-yinliang"
            @click="muted(index)"
          ></i>
          <i
            v-if="!fullFlag"
            class="iconfont icon-quanping"
            @click="fullScreen(index)"
          ></i>
          <i
            v-else
            class="iconfont icon-suoxiao"
            @click="ExitFullscreen()"
          ></i>
        </div>
      </div>
    </li>
  </ul>
</template>
<script lang="ts">
import {
  defineComponent,
  Ref,
  inject,
  reactive,
  toRefs,
  watch,
  nextTick,
  onUnmounted,
} from "vue";
import { Fullscreen, ExitFullscreen, isFullscreenFn } from "@/assets/js/base";
import { useMessage } from "@/hooks/web/useMessage";
import flvjs from "flv.js";
import API from "@/api/monitorCenter";

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
    const message = useMessage();
    const videoFlag = <Ref<boolean>>inject("videoFlag");
    const videoNum = <Ref<number>>inject("videoNum");

    const data = reactive({
      vehInfoList: <any[]>[],
      listMap: new Map(),
      videoList: <any[]>[],
      fullFlag: false,
      socket: <any>null,
      /** 播放 */
      startPlay(e: any, index: number) {
        if ('N' in data.vehInfoList[index]) {
          data.canvasFun(index);
          e.target.parentElement.style.display = "none";
        } else {
          message.error('暂无视频');
        }
      },
      /** 暂停 */
      pause(index: number) {
        if (data.videoList[index]) {
          data.flv_destroy(data.videoList[index]);

          data.videoList.splice(index, 1);

          (document.querySelectorAll(".startBtn") as any)[
            index || 0
          ].style.display = "flex";

          console.log(data.videoList);
        } else {
          message.error('暂无视频');
        }
      },
      /** 静音 */
      muted(index: number) {
        const video = document.querySelectorAll(".video__source") as any;

        video[index || 0].muted = !video[index || 0].muted;
        if (video[index || 0].muted) {
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
      /** 截屏 */
      capture(index: number) {
        const videoBox = document.querySelector(".tachograph") as any;
        const video = document.querySelectorAll(".video__source") as any;

        const canvas = document.createElement("canvas") as any;
        canvas.width = video[index || 0].videoWidth;
        canvas.height = video[index || 0].videoHeight;
        canvas
          .getContext("2d")
          .drawImage(video[index || 0], 0, 0, canvas.width, canvas.height);
        const strDataURL = canvas.toDataURL("image/png");
        var arr = strDataURL.split(","),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {
          type: mime,
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = new Date().getTime() + "";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 1000);
      },
      setIsFullScreen() {
        data.fullFlag = isFullscreenFn();
      },
      /** 全屏 */
      fullScreen(index: number) {
        const video = document.querySelectorAll(".player") as any;
        Fullscreen(video[index || 0]);
      },
      canvasFun(index: number) {
        const video = document.querySelectorAll(".video__source") as any;

        if ("N" in data.vehInfoList[index]) {
          let devNum = data.vehInfoList[index].N;
              devNum =
                new Array(12 - devNum.length).fill(0).join("") +
                data.vehInfoList[index].N;
          data.videoList.splice(index, 0,
            flvjs.createPlayer({
              type: "flv",
              isLive: true,
              // url: 'f1.flv',
              url: `${CONFIG.wsUrl}/webSocket/live?simChannel=${devNum}-1`,
            })
          );
          data.videoList[index].attachMediaElement(video[index]);
          try {
            data.videoList[index].load();
            data.videoList[index].play();
          } catch (error) {
            console.log(error);
          }
        }

        // video[index || 0].play();
        // video[index || 0].onended = () => {
        //   (document.querySelectorAll(".startBtn") as any)[
        //     index || 0
        //   ].style.display = "flex";
        // };
      },
      // 获取视频
      getVideo() {
        data.vehInfoList.forEach(async (item) => {
          if (item.V) {
            const info = {
              channelNo: 1,
              dataType: 1,
              streamType: 1,
              vehicleId: item.V,
              clientType: 0,
              commandType: "VIDEO_PLAY",
            };
            const { flag, msg } = await API.realVideoReq(info);
            if (flag !==1)　{
              message.error(msg);
            }
          }
        });
        // data.initWs();
      },
      flv_destroy(player: any) {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
        player = null;
      },
      // initWs() {
      // 192.168.130.142  47.107.241.109
      // let devNum = data.vehInfoList[0].N;
      // devNum = (new Array(12 - devNum.length).fill(0)).join('') + data.vehInfoList[0].N;
      // data.socket = new WsUtil({
      //   url: ``,
      //   onmessage: data.wxMessage,
      // });
      // },
    });

    watch(
      () => props.vehInfo,
      (val) => {
        if (!val) return;

        data.listMap.set(val.V, val); // 去重
        const length = [...data.listMap.values()].length;
        const list = [...data.listMap.values()];
        console.log(length);
        data.vehInfoList =
          length <= 1
            ? list
            : length == 2 || length == 3 || length === 4
            ? list.concat(new Array(4 - length).fill({}))
            : length === 6
            ? list.concat(new Array(6 - length).fill({}))
            : length === 8
            ? list.concat(new Array(8 - length).fill({}))
            : list.concat(new Array(8 - length).fill({}));

        videoNum.value =
          length <= 1
            ? 1
            : length <= 4
            ? 4
            : length <= 6
            ? 6
            : length <= 8
            ? 8
            : 8;
        videoFlag.value = true;

        nextTick(() => {
          data.getVideo();

          const videos = document.querySelectorAll(".video__source");
          const playBtns = document.querySelectorAll(".startBtn") as any;

          // data.videoList.length !== 0 && data.videoList.forEach(item => {
          //   data.flv_destroy(item);
          // });
          // data.videoList = [];
          videos.forEach((item, index) => {
            if ("N" in data.vehInfoList[index] && !data.videoList[index]) {
              playBtns[index].style.display = "none";
              // console.log(index, 'add', data.vehInfoList[index]);
              let devNum = data.vehInfoList[index].N;
              devNum =
                new Array(12 - devNum.length).fill(0).join("") +
                data.vehInfoList[index].N;
              data.videoList.push(
                flvjs.createPlayer({
                  type: "flv",
                  isLive: true,
                  // url: 'f1.flv',
                  url: `${CONFIG.wsUrl}/webSocket/live?simChannel=${devNum}-1`,
                })
              );
              data.videoList[index].attachMediaElement(item);
              try {
                data.videoList[index].load();
                data.videoList[index].play();
              } catch (error) {
                console.log(error);
              }
            } else if (data.videoList[index]) {
              playBtns[index].style.display = 'none';
              // console.log(index, 'load', data.videoList[index]);
              data.videoList[index].unload();
              data.videoList[index].attachMediaElement(item);
              try {
                data.videoList[index].load();
                data.videoList[index].play();
              } catch (error) {
                console.log(error);
              }
            }
          });
        });
      },
      {
        immediate: true,
      }
    );
    watch(
      videoFlag,
      (val) => {
        if (val) {
          window.addEventListener("resize", data.setIsFullScreen);
        } else {
          window.removeEventListener("resize", data.setIsFullScreen);
        }
      },
      {
        immediate: true,
      }
    );
    watch(
      () => videoNum.value,
      (val) => {
        // console.log(val);
        const length = [...data.listMap.values()].length;
        const list = [...data.listMap.values()];
        if (list.length >= val) {
          data.vehInfoList = list.slice(0, val);
          return;
        }
        data.vehInfoList =
          val <= 1 ? list : list.concat(new Array(val - length).fill({}));
      }
    );

    onUnmounted(() => {
      console.log('视频销毁');
      data.videoList.length !== 0 && data.videoList.forEach(item => {
        data.flv_destroy(item);
      });
      data.videoList = [];
    });

    return {
      Fullscreen,
      ExitFullscreen,
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.tachograph {
  // position: relative;
  // bottom: 0;
  // left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: #000;
  display: grid;

  &.gongge1 {
    grid-template-columns: 100%;
    grid-template-rows: 100%;
  }

  &.gongge4 {
    grid-template-columns: repeat(2, 50%);
    grid-template-rows: repeat(2, 50%);
  }

  &.gongge6 {
    grid-template-columns: repeat(3, 33%);
    grid-template-rows: repeat(3, 33%);

    .item-1 {
      grid-column-start: 1;
      grid-column-end: 3;
      grid-row-start: 1;
      grid-row-end: 3;

      .el-icon-video-play {
        font-size: 51px;
      }
    }

    li .el-icon-video-play {
      font-size: 31px;
    }
  }

  &.gongge8 {
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(4, 25%);

    .item-1 {
      grid-column-start: 1;
      grid-column-end: 4;
      grid-row-start: 1;
      grid-row-end: 4;
      .el-icon-video-play {
        font-size: 51px;
      }
    }

    li .el-icon-video-play {
      font-size: 31px;
    }
  }

  li {
    position: relative;
    &:hover .tachograph__hover {
      display: flex;
    }

    video {
      width: 100%;
      height: 100%;
    }
  }

  &__hover {
    display: none;
    height: 40px;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background: #fff;
    opacity: 0.9;
    position: absolute;
    bottom: 0;
    z-index: 3;

    h4 {
      font-weight: 600;
      flex: 1;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__control {
      .iconfont {
        cursor: pointer;
        margin-right: 10px;
        font-size: 18px;

        &:hover {
          color: #3381e8;
        }
      }
      .icon-tingzhi:hover {
        color: red;
      }
    }
  }

  .startBtn {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .el-icon-video-play {
      font-size: 51px;
      color: #fff;
      cursor: pointer;
    }
  }
}
video::-webkit-media-controls {
  display: none !important;
}
.fullscreen-controls {
  z-index: 2147483647;
  height: 40px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  background: #fff;
  opacity: 0.9;
  position: absolute;
  bottom: 0;
}
</style>
