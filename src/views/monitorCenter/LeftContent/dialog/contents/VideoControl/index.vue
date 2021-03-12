<template>
  <div class="videoControl">
    <el-form
      ref="ruleForm"
      :model="formData"
      class="demo-form-inline"
      label-width="150px"
    >
      <el-form-item label="控制指令">
        <el-select v-model="controlType" placeholder="请选择" size="small">
          <el-option
            v-for="item in optionsOfControl"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关闭音视频类型">
        <el-select v-model="closeType" placeholder="请选择" size="small">
          <el-option
            v-for="item in optionsOfClose"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="切换码流类型">
        <el-select v-model="streamType" placeholder="请选择" size="small">
          <el-option
            v-for="item in optionsOfStram"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
  <div class="footer">
    <span class="dialog-footer">
      <!-- 用于布局的无用dom -->
      <span></span>
      <span>
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
        <el-button
          type="primary"
          @click="confirm"
        >确 定</el-button>
      </span>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
import { useFunction } from "../../../../function";

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
  setup(props, { emit }) {
    const { realControlReq, showMsg } = useFunction();
    const data = reactive({
      formData: {},
      controlType: 0,
      optionsOfControl: [
        {
          value: 0,
          label: "关闭音视频传输指令",
        },
        {
          value: 1,
          label: "切换码流",
        },
        {
          value: 2,
          label: "暂停该通道所有流的发送",
        },
        {
          value: 3,
          label: "恢复暂停前流的发,与暂停前的流类,型一致",
        },
        {
          value: 4,
          label: "关闭双向对讲",
        },
      ],
      closeType: 0,
      optionsOfClose: [
        {
          value: 0,
          label: "关闭该通道有关的音视频数据",
        },
        {
          value: 1,
          label: "只关闭该通道有关的音频，保留该通道,有关的视频",
        },
        {
          value: 2,
          label: "只关闭该通道有关的视频，保留该通道,有关的音频",
        },
        
      ],
      streamType: 0,
      optionsOfStram: [
        {
          value: 0,
          label: "主码流",
        },
        {
          value: 1,
          label: "子码流",
        },
      ],
      async confirm() {
        const info = {
          channelNo: 1,
          controlType: data.controlType,
          closeType: data.closeType,
          streamType: data.streamType,
          vehicleId: props.vehInfo.V,
          commandType: 'VIDEO_PLAY_CONTROL',
        };

        const res = await realControlReq(info);
        if (res === 1) {
          showMsg("命令已下发，结果请查看命令下发报表");
          emit("update:visible", false);
        }
      }
    });

    return {
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.videoControl {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.footer {
  width: 100%;
  height: 60px;
  padding: 10px 16px;
  border-top: 1px solid #d9e0e9;
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
::v-deep(.el-button) {
  border-radius: 0 !important;
}
::v-deep(.el-button--primary) {
  background: #0e60db !important;
  border-color: #0e60db !important;
  &:hover {
    opacity: 0.8;
  }
}
::v-deep(.el-input__inner) {
  width: 360px;
}
</style>
