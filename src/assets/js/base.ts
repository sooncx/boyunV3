import store from "@/store/index";
// 防抖
export const debounce: Function = (function () {
    let timer = 0;
    return function (callback: Function, ms: number): void {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();
// 是否全屏
export function isFullscreenFn() {
    let res = (document as any).fullscreen ||
        (document as any).msFullscreenElement ||
        (document as any).mozFullScreen ||
        (document as any).webkitIsFullScreen || false;
    return res;
}
// 退出全屏
export function ExitFullscreen() {
    //W3C
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    //FireFox
    else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
    }
    //Chrome等
    else if ((document as any).webkitCancelFullScreen) {
        (document as any).webkitCancelFullScreen();
    }
    //IE11
    else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
    }
}
// 全屏
export function Fullscreen(dom = null as any) {
    const docElm = dom || document.documentElement as any;
    //W3C
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    }
    //FireFox
    else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    }
    //Chrome等
    else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
    //IE11
    else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    }
}
export const TwoCoordinateAzimuth: Function = function (start: any, end: any) {
    let d = 0,
        lat_a = (start.lat * Math.PI) / 180,
        lng_a = (start.lng * Math.PI) / 180,
        lat_b = (end.lat * Math.PI) / 180,
        lng_b = (end.lng * Math.PI) / 180;

    d =
        Math.sin(lat_a) * Math.sin(lat_b) +
        Math.cos(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
    d = Math.sqrt(1 - d * d);
    d = (Math.cos(lat_b) * Math.sin(lng_b - lng_a)) / d;
    d = (Math.asin(d) * 180) / Math.PI;
    d = d % 360;

    //判断在终点在第几象限
    const x = end.lng - start.lng,
        y = end.lat - start.lat;
    if (x < 0 && y > 0) {
        d = 360 + d;
    } else if (y < 0) {
        d = 180 - d;
    }

    d = d >= 0 ? d : 360 + d;
    return d;
}
export const deepClone: Function = function (source: any) {
    if (!source && typeof source !== "object") {
        throw new Error("error arguments");
    }
    const targetObj = (source.constructor === Array ? [] : {}) as any;
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === "object") {
            targetObj[keys] = deepClone(source[keys]);
        } else {
            targetObj[keys] = source[keys];
        }
    });
    return targetObj;
}
//获取地图车辆图标
export const getCarIcon: Function = function ({ iconType = 0, Z = 0, B = null } = {}, restype = 'map') {
    let statusObj: any = {};
    let list = [
        { iconName: "汽车", iconType: 0 },
        { iconName: "牛", iconType: 1 },
        { iconName: "狗", iconType: 2 },
        { iconName: "人", iconType: 3 },
        { iconName: "电动车", iconType: 4 },
        { iconName: "船", iconType: 5 },
        { iconName: "挖掘机", iconType: 6 },
        { iconName: "箭头", iconType: 7 },
        { iconName: "大货车", iconType: 8 },
        { iconName: "大巴车", iconType: 9 },
        { iconName: "羊", iconType: 10 },
        { iconName: "宠物", iconType: 11 },
        { iconName: "设备", iconType: 12 },
        { iconName: "摩托车", iconType: 13 },
    ];
    // 后台返回图标类型映射)
    if (store.state.carIconType && store.state.carIconType.length > 0) {
        list = store.state.carIconType;
    }
    // 图标状态
    statusObj = {
        0: "offline", //静止
        1: "online", //运动
        2: "stop", //作业
        // 3: "neverOnline", //离线
        // 4: "overdue", //从未上线
    };
    const typeMap = new Map([
        ["0", {
            label: "汽车",
            key: 0,
            value: "icon-car1",
        }],
        ["1", {
            label: "牛",
            key: 1,
            value: "icon-niu",
        }],
        ["2", {
            label: "狗",
            key: 2,
            value: "icon-bsj-gou",
        }],
        ["3", {
            label: "人",
            key: 3,
            value: "icon-bsj-ren",
        }],
        ["4", {
            label: "电动车",
            key: 4,
            value: "icon-ddc",
        }],
        ["5", {
            label: "船",
            key: 5,
            value: "icon-bsj-chuan",
        }],
        ["6", {
            label: "挖掘机",
            key: 6,
            value: "icon-wajueji",
        }]
    ]) as any;
    // 排序后的图标映射
    list.map((item: any) => {
        if (typeMap.has(item.iconType.toString())) {
            typeMap.set(item.iconType.toString(), { label: item.iconName, key: item.iconType, value: typeMap.get(item.iconType.toString()).value })
        }
    });
    // 返回图标列表
    if (restype == "all") {
        return [...typeMap.values()];
    }
    // 返回侧边栏车辆对应图标
    if (restype == "list") {
        // 若车辆对应图标不存在，则默认展示第一个
        if (!typeMap.get(iconType.toString())) {
            return typeMap.get([...typeMap.keys()][0]).value;
        }
        return typeMap.get(iconType.toString()).value;
    }
    // 默认是离线状态
    const status = statusObj[Z] || statusObj[0];
    let type: number = 0;
    if (typeMap.has(iconType.toString())) {
        type = parseInt(iconType as any);
    } else {
        type = parseInt([...typeMap.keys()][0]);
    }
    if (B && B != "") {
        // 返回地图车辆报警图片 
        return require(`@/assets/img/car/carIcon/${type}/map_alarm.png`);
    }
    // 返回地图车辆对应图片 
    return require(`@/assets/img/car/carIcon/${type}/map_${status}.png`);
}