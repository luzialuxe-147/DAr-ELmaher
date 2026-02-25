// ===== API Configuration =====

// تحديد رابط API حسب البيئة (تطوير أو إنتاج)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/dar-almaher/us-central1/api'  // للتجربة المحلية
    : 'https://us-central1-dar-almaher.cloudfunctions.net/api'; // للإنتاج (عدل الرابط بعد النشر)

// ===== دوال المصادقة (Authentication) =====

/**
 * تسجيل مستخدم جديد
 * @param {Object} userData - بيانات المستخدم
 */
async function registerUser(userData) {
    try {
        utils.toggleLoader(true);
        
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            utils.showNotification('تم التسجيل بنجاح! سيتم التواصل معك قريباً', 'success');
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'حدث خطأ في التسجيل', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Registration error:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    } finally {
        utils.toggleLoader(false);
    }
}

/**
 * تسجيل الدخول
 * @param {string} email 
 * @param {string} password 
 */
async function loginUser(email, password) {
    try {
        utils.toggleLoader(true);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // حفظ التوكن وبيانات المستخدم
            utils.setStorage('token', data.token);
            utils.setStorage('user', data.user);
            
            utils.showNotification('تم تسجيل الدخول بنجاح', 'success');
            
            // توجيه المستخدم حسب دوره
            if (data.user.role === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'pages/dashboard.html';
            }
            
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'خطأ في البريد أو كلمة المرور', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    } finally {
        utils.toggleLoader(false);
    }
}

/**
 * تسجيل الخروج
 */
function logoutUser() {
    utils.removeStorage('token');
    utils.removeStorage('user');
    window.location.href = 'index.html';
}

/**
 * التحقق من حالة تسجيل الدخول
 * @returns {boolean}
 */
function isAuthenticated() {
    const token = utils.getStorage('token');
    return !!token;
}

/**
 * جلب بيانات المستخدم الحالي
 * @returns {Object|null}
 */
function getCurrentUser() {
    return utils.getStorage('user');
}

// ===== دوال الطلاب (Students) =====

/**
 * جلب عدد الطلاب
 */
async function fetchStudentCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/students/count`);
        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error fetching student count:', error);
        return 500; // قيمة افتراضية
    }
}

/**
 * جلب بيانات الطالب (للوحة التحكم)
 */
async function fetchStudentProfile() {
    const token = utils.getStorage('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/student/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            if (response.status === 401) {
                logoutUser(); // توكن منتهي
            }
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

/**
 * تحديث بيانات الطالب
 * @param {Object} updateData 
 */
async function updateStudentProfile(updateData) {
    const token = utils.getStorage('token');
    if (!token) return null;

    try {
        utils.toggleLoader(true);
        
        const response = await fetch(`${API_BASE_URL}/student/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (response.ok) {
            utils.showNotification('تم التحديث بنجاح', 'success');
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'حدث خطأ', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    } finally {
        utils.toggleLoader(false);
    }
}

// ===== دوال التواصل (Contact) =====

/**
 * إرسال رسالة تواصل
 * @param {Object} contactData 
 */
async function sendContactMessage(contactData) {
    try {
        utils.toggleLoader(true);
        
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();
        
        if (response.ok) {
            utils.showNotification('تم إرسال رسالتك بنجاح', 'success');
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'حدث خطأ', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error sending message:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    } finally {
        utils.toggleLoader(false);
    }
}

/**
 * الاشتراك في النشرة البريدية
 * @param {string} email 
 */
async function subscribeNewsletter(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (response.ok) {
            utils.showNotification('تم الاشتراك بنجاح', 'success');
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'حدث خطأ', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    }
}

// ===== دوال البرامج (Programs) =====

/**
 * جلب قائمة البرامج
 */
async function fetchPrograms() {
    try {
        const response = await fetch(`${API_BASE_URL}/programs`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
}

/**
 * التسجيل في برنامج
 * @param {string} programId 
 */
async function enrollInProgram(programId) {
    const token = utils.getStorage('token');
    if (!token) {
        utils.showNotification('الرجاء تسجيل الدخول أولاً', 'error');
        window.location.href = 'pages/login.html';
        return;
    }

    try {
        utils.toggleLoader(true);
        
        const response = await fetch(`${API_BASE_URL}/programs/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ programId })
        });

        const data = await response.json();
        
        if (response.ok) {
            utils.showNotification('تم التسجيل في البرنامج بنجاح', 'success');
            return { success: true, data };
        } else {
            utils.showNotification(data.message || 'حدث خطأ', 'error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.error('Error enrolling:', error);
        utils.showNotification('فشل الاتصال بالخادم', 'error');
        return { success: false, error: 'Network error' };
    } finally {
        utils.toggleLoader(false);
    }
}

// ===== Export API functions =====
window.api = {
    registerUser,
    loginUser,
    logoutUser,
    isAuthenticated,
    getCurrentUser,
    fetchStudentCount,
    fetchStudentProfile,
    updateStudentProfile,
    sendContactMessage,
    subscribeNewsletter,
    fetchPrograms,
    enrollInProgram
};