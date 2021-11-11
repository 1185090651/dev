import Clipboard from 'clipboard/dist/clipboard.min';

/**
 * 背景：目前工作台`复制到剪贴板`使用的是`vue-clipboard2`，存在以下痛点
 * - 与Vue框架强绑定
 * - 想使用必须注册插件，工作台sailSupport项目过多每次都注册较繁琐
 * - 业务场景中使用的方法较单一，基本只使用`复制`功能
 * - vue-clipboard2使用的是clipboard包，clipboard包内部使用的document.execCommand()实现，该方式存在安全性问题，目前浏览器已不建议使用
 * 目标：封装一个与框架脱离的`复制粘贴`函数工具
 * 方案：
 * - 首先使用clipboard包封装的函数
 * - 使用新`Web Clipboard API`作为兜底，该API被设计就是用来取代使用 document.execCommand() 的剪贴板访问方式，但是该API对于IE浏览器或者旧浏览器版本不兼容且访问和写入需要请求用户权限，增加了使用步骤
 * - 一期只实现复制功能，后面有时间会加入粘贴
 */

export function copy(text) {
  return new Promise(((resolve, reject) => {
    const fakeElement = document.createElement('button');
    const clipboard = new Clipboard(fakeElement, {
      text() {
        return text;
      },
      action() {
        return 'copy';
      },
      container: document.body,
    });
    clipboard.on('success', e => {
      clipboard.destroy();
      resolve(e);
    });
    clipboard.on('error', e => {
      clipboard.destroy();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          resolve();
        }).catch(error => reject(error));
        return;
      }
      reject(e);
    });
    document.body.appendChild(fakeElement);
    fakeElement.click();
    document.body.removeChild(fakeElement);
  }));
}

export default null;
