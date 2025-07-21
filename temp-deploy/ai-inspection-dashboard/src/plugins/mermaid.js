// Mermaid图表初始化插件
import mermaid from 'mermaid';

export default {
  install(app) {
    // 配置Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });

    // 添加全局方法
    app.config.globalProperties.$mermaid = mermaid;

    // 添加全局指令
    app.directive('mermaid', {
      mounted(el) {
        // 渲染Mermaid图表
        mermaid.init(undefined, el);
      },
      updated(el) {
        el.removeAttribute('data-processed');
        mermaid.init(undefined, el);
      }
    });
  }
}; 