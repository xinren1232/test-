/**
 * IQE动态检验系统 - 浏览器兼容性检查工具
 */

/**
 * 检测浏览器是否支持Web Speech API的语音识别功能
 * @returns {boolean} 是否支持语音识别
 */
export const isSpeechRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 
         'webkitSpeechRecognition' in window || 
         'mozSpeechRecognition' in window || 
         'msSpeechRecognition' in window;
};

/**
 * 获取语音识别构造函数
 * @returns {SpeechRecognition|null} 语音识别构造函数或null
 */
export const getSpeechRecognition = () => {
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition;
  } else if ('webkitSpeechRecognition' in window) {
    return window.webkitSpeechRecognition;
  } else if ('mozSpeechRecognition' in window) {
    return window.mozSpeechRecognition;
  } else if ('msSpeechRecognition' in window) {
    return window.msSpeechRecognition;
  }
  
  return null;
};

/**
 * 检测浏览器是否支持Web Speech API的语音合成功能
 * @returns {boolean} 是否支持语音合成
 */
export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * 获取可用的语音合成声音
 * @returns {Array} 可用的语音合成声音列表
 */
export const getSpeechSynthesisVoices = () => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  
  return window.speechSynthesis.getVoices() || [];
};

/**
 * 检测浏览器是否支持文件API
 * @returns {boolean} 是否支持文件API
 */
export const isFileAPISupported = () => {
  return 'File' in window && 'FileReader' in window && 'FileList' in window;
};

/**
 * 检测浏览器是否支持Canvas
 * @returns {boolean} 是否支持Canvas
 */
export const isCanvasSupported = () => {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext && canvas.getContext('2d'));
};

/**
 * 检测浏览器是否支持WebGL
 * @returns {boolean} 是否支持WebGL
 */
export const isWebGLSupported = () => {
  const canvas = document.createElement('canvas');
  try {
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

/**
 * 检测浏览器是否支持本地存储
 * @returns {boolean} 是否支持本地存储
 */
export const isLocalStorageSupported = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    const result = localStorage.getItem(test) === test;
    localStorage.removeItem(test);
    return result;
  } catch (e) {
    return false;
  }
};

/**
 * 检测浏览器是否支持IndexedDB
 * @returns {boolean} 是否支持IndexedDB
 */
export const isIndexedDBSupported = () => {
  return 'indexedDB' in window;
};

/**
 * 检测设备是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 检测浏览器是否支持触摸事件
 * @returns {boolean} 是否支持触摸事件
 */
export const isTouchSupported = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 获取浏览器信息
 * @returns {Object} 浏览器信息
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = "未知";
  let browserVersion = "";
  
  // 检测浏览器类型
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)[1];
  } else if (ua.indexOf("Edge") > -1) {
    browserName = "Edge";
    browserVersion = ua.match(/Edge\/([\d.]+)/)[1];
  } else if (ua.indexOf("Edg") > -1) {
    browserName = "Edge Chromium";
    browserVersion = ua.match(/Edg\/([\d.]+)/)[1];
  } else if (ua.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)[1];
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = ua.match(/Safari\/([\d.]+)/)[1];
  } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
    browserVersion = ua.match(/MSIE ([\d.]+)/) ? ua.match(/MSIE ([\d.]+)/)[1] : "11.0";
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: ua,
    isMobile: isMobileDevice(),
    isTouch: isTouchSupported(),
    features: {
      speechRecognition: isSpeechRecognitionSupported(),
      speechSynthesis: isSpeechSynthesisSupported(),
      fileAPI: isFileAPISupported(),
      canvas: isCanvasSupported(),
      webGL: isWebGLSupported(),
      localStorage: isLocalStorageSupported(),
      indexedDB: isIndexedDBSupported()
    }
  };
};

/**
 * 检测系统是否支持所有必要功能
 * @returns {Object} 支持情况对象
 */
export const checkSystemCompatibility = () => {
  return {
    speechRecognition: isSpeechRecognitionSupported(),
    speechSynthesis: isSpeechSynthesisSupported(),
    fileAPI: isFileAPISupported(),
    canvas: isCanvasSupported()
  };
}; 