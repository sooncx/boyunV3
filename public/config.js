const CONFIG = {
  baseUrl: "http://106.53.244.185:9999", // 测试
  // baseUrl: "http://47.106.47.148:9999", // 生产
  wsUrl: "ws://47.107.241.109:17788",
  // wsUrl: "ws://192.168.130.142:17788",
}

function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

var flag = IsPC(); // true为PC端，false为手机端