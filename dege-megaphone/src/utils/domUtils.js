// DOM操作工具函数
export class DOMUtils {
    // 批量获取DOM元素
    static getElementsByIds(ids) {
        const elements = {};
        ids.forEach(id => {
            const camelCaseId = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            elements[camelCaseId] = document.getElementById(id);
        });
        return elements;
    }

    // 添加CSS类
    static addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    // 移除CSS类
    static removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    // 切换CSS类
    static toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }

    // 检查是否包含CSS类
    static hasClass(element, className) {
        return element && className && element.classList.contains(className);
    }

    // 设置元素文本内容
    static setText(element, text) {
        if (element) {
            element.textContent = text || '';
        }
    }

    // 设置元素HTML内容
    static setHTML(element, html) {
        if (element) {
            element.innerHTML = html || '';
        }
    }

    // 设置元素属性
    static setAttribute(element, attr, value) {
        if (element && attr) {
            element.setAttribute(attr, value);
        }
    }

    // 获取元素属性
    static getAttribute(element, attr) {
        return element && attr ? element.getAttribute(attr) : null;
    }

    // 添加事件监听器
    static addEventListener(element, event, handler, options = {}) {
        if (element && event && handler) {
            element.addEventListener(event, handler, options);
        }
    }

    // 移除事件监听器
    static removeEventListener(element, event, handler, options = {}) {
        if (element && event && handler) {
            element.removeEventListener(event, handler, options);
        }
    }

    // 创建元素
    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        element.textContent = textContent;
        return element;
    }

    // 显示元素
    static show(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    // 隐藏元素
    static hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
}

export default DOMUtils;