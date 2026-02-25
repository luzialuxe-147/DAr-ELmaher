// ===== Utilities and Helper Functions =====

/**
 * عرض إشعار للمستخدم
 * @param {string} message - النص المراد عرضه
 * @param {string} type - نوع الإشعار (success, error, info)
 */
function showNotification(message, type = 'info') {
    // إزالة أي إشعار سابق
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // اختيار الأيقونة حسب النوع
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // إضافة للإشعار للصفحة
    document.body.appendChild(notification);
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * عرض مؤشر التحميل
 * @param {boolean} show - true لإظهار، false لإخفاء
 */
function toggleLoader(show) {
    let loader = document.getElementById('global-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(loader);
        }
    } else {
        if (loader) {
            loader.remove();
        }
    }
}

/**
 * حفظ البيانات في localStorage
 * @param {string} key 
 * @param {any} value 
 */
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * جلب البيانات من localStorage
 * @param {string} key 
 * @returns {any}
 */
function getStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

/**
 * حذف البيانات من localStorage
 * @param {string} key 
 */
function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Error removing from localStorage:', e);
    }
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * التحقق من صحة رقم الهاتف السعودي
 * @param {string} phone 
 * @returns {boolean}
 */
function isValidSaudiPhone(phone) {
    const re = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
    return re.test(phone);
}

/**
 * تنسيق التاريخ
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * إنشاء عنصر HTML من نص
 * @param {string} html 
 * @returns {HTMLElement}
 */
function createElementFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
}

/**
 * تمرير سلس وسلس للعنصر
 * @param {string} elementId 
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * نسخ نص إلى الحافظة
 * @param {string} text 
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم النسخ بنجاح', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('فشل النسخ', 'error');
    }
}

/**
 * تأخير تنفيذ دالة (debounce)
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Export functions للاستخدام العام =====
window.utils = {
    showNotification,
    toggleLoader,
    setStorage,
    getStorage,
    removeStorage,
    isValidEmail,
    isValidSaudiPhone,
    formatDate,
    createElementFromHTML,
    scrollToElement,
    copyToClipboard,
    debounce
};