import { useTimeoutFn } from '@vueuse/core';
import { unref, Ref, nextTick } from 'vue';
import { useDebounce } from '@/hooks/core/useDebounce';
import { useEventListener } from '@/hooks/event/useEventListener';
import { useBreakpoint } from '@/hooks/event/useBreakpoint';
import { tryOnUnmounted } from '@/utils/helper/vueHelper';
import type { EChartOption, ECharts } from 'echarts';
import echarts from 'echarts';
export type { EChartOption, ECharts };

export function useECharts(
  elRef: Ref<HTMLDivElement>
) {
  let chartInstance: Nullable<ECharts> = null;
  let resizeFn: Fn = resize;
  let removeResizeFn: Fn = () => {};

  const [debounceResize] = useDebounce(resize, 200);
  resizeFn = debounceResize;

  function init () {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }
    chartInstance = echarts.init(el);
    const { removeEvent } = useEventListener({
      el: window,
      name: 'resize',
      listener: resizeFn,
    });
    removeResizeFn = removeEvent;
    const { widthRef, screenEnum } = useBreakpoint();
    if (unref(widthRef) <= screenEnum.MD) {
      useTimeoutFn(() => {
        resizeFn();
      }, 30);
    }
  }

  function setOptions(options: any, clear = true) {
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          init();

          if (!chartInstance) return;
        }
        clear && chartInstance.clear();

        chartInstance && chartInstance.setOption(options);
      }, 30);
    });
  }

  function resize() {
    if (!chartInstance) return;
    chartInstance.resize();
  }

  tryOnUnmounted(() => {
    if (!chartInstance) return;
    removeResizeFn();
    chartInstance.dispose();
    chartInstance = null;
  });

  return {
    setOptions,
    echarts,
    resize,
  }
};