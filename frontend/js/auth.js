// ===== Auth Module - إدارة متقدمة للمصادقة =====

class Auth {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'auth_user';
        this.rememberKey = 'auth_remember';
        this.tokenExpiryKey = 'auth_expiry';
    }

    /**
     * حفظ بيانات المصادقة
     */
    setAuth(token, user, remember = false) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (remember ? 30 : 7)); // 30 يوم إذا تذكرني، 7 أيام افتراضي

        if (remember) {
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());
            localStorage.setItem(this.rememberKey, 'true');
        } else {
            sessionStorage.setItem(this.tokenKey, token);
            sessionStorage.setItem(this.userKey, JSON.stringify(user));
            sessionStorage.setItem(this.tokenExpiryKey, expiry.toISOString());
        }
    }

    /**
     * جلب التوكن
     */
    getToken() {
        // جرب من localStorage أولاً
        let token = localStorage.getItem(this.tokenKey);
        if (token) return token;
        
        // جرب من sessionStorage
        token = sessionStorage.getItem(this.tokenKey);
        return token;
    }

    /**
     * جلب بيانات المستخدم
     */
    getUser() {
        try {
            // جرب من localStorage أولاً
            let userStr = localStorage.getItem(this.userKey);
            if (userStr) return JSON.parse(userStr);
            
            // جرب من sessionStorage
            userStr = sessionStorage.getItem(this.userKey);
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }

    /**
     * التحقق من صحة التوكن
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // التحقق من تاريخ انتهاء الصلاحية
        const expiry = localStorage.getItem(this.tokenExpiryKey) || sessionStorage.getItem(this.tokenExpiryKey);
        if (expiry) {
            const expiryDate = new Date(expiry);
            if (expiryDate < new Date()) {
                this.logout();
                return false;
            }
        }

        return true;
    }

    /**
     * تسجيل الخروج
     */
    logout(redirect = true) {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenExpiryKey);
        localStorage.removeItem(this.rememberKey);
        
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
        sessionStorage.removeItem(this.tokenExpiryKey);

        if (redirect) {
            window.location.href = 'login.html';
        }
    }

    /**
     * تجديد التوكن
     */
    async refreshToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = this.getUser();
                const remember = localStorage.getItem(this.rememberKey) === 'true';
                this.setAuth(data.token, user, remember);
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }

        return false;
    }

    /**
     * التحقق من الصلاحيات
     */
    hasRole(requiredRole) {
        const user = this.getUser();
        if (!user) return false;

        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role);
        }

        return user.role === requiredRole;
    }

    /**
     * تحديث بيانات المستخدم
     */
    updateUser(updatedData) {
        const currentUser = this.getUser();
        if (!currentUser) return;

        const newUser = { ...currentUser, ...updatedData };
        
        // حفظ في نفس المكان الذي جئنا منه
        if (localStorage.getItem(this.userKey)) {
            localStorage.setItem(this.userKey, JSON.stringify(newUser));
        } else if (sessionStorage.getItem(this.userKey)) {
            sessionStorage.setItem(this.userKey, JSON.stringify(newUser));
        }
    }

    /**
     * تسجيل الدخول باستخدام وسائل التواصل
     */
    async socialLogin(provider) {
        try {
            utils.showNotification(`جاري تسجيل الدخول باستخدام ${provider}...`, 'info');
            
            // هنا سيتم إضافة تكامل مع OAuth providers
            // Google, Facebook, Twitter, إلخ
            
            // مثال مؤقت
            window.location.href = `${API_BASE_URL}/auth/${provider}`;
            
        } catch (error) {
            console.error('Social login error:', error);
            utils.showNotification('فشل تسجيل الدخول', 'error');
        }
    }

    /**
     * إعادة تعيين كلمة المرور
     */
    async resetPassword(email) {
        try {
            utils.toggleLoader(true);
            
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                utils.showNotification('تم إرسال رابط إعادة التعيين إلى بريدك', 'success');
                return true;
            } else {
                utils.showNotification(data.message || 'حدث خطأ', 'error');
                return false;
            }
        } catch (error) {
            console.error('Reset password error:', error);
            utils.showNotification('فشل الاتصال بالخادم', 'error');
            return false;
        } finally {
            utils.toggleLoader(false);
        }
    }

    /**
     * تغيير كلمة المرور
     */
    async changePassword(oldPassword, newPassword) {
        const token = this.getToken();
        if (!token) {
            utils.showNotification('الرجاء تسجيل الدخول أولاً', 'error');
            return false;
        }

        try {
            utils.toggleLoader(true);
            
            const response = await fetch(`${API_BASE_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();
            
            if (response.ok) {
                utils.showNotification('تم تغيير كلمة المرور بنجاح', 'success');
                return true;
            } else {
                utils.showNotification(data.message || 'حدث خطأ', 'error');
                return false;
            }
        } catch (error) {
            console.error('Change password error:', error);
            utils.showNotification('فشل الاتصال بالخادم', 'error');
            return false;
        } finally {
            utils.toggleLoader(false);
        }
    }

    /**
     * التحقق من البريد الإلكتروني
     */
    async verifyEmail(code) {
        const token = this.getToken();
        if (!token) return false;

        try {
            utils.toggleLoader(true);
            
            const response = await fetch(`${API_BASE_URL}/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();
            
            if (response.ok) {
                // تحديث حالة المستخدم
                const user = this.getUser();
                user.emailVerified = true;
                this.updateUser(user);
                
                utils.showNotification('تم توثيق البريد الإلكتروني', 'success');
                return true;
            } else {
                utils.showNotification(data.message || 'رمز التحقق غير صحيح', 'error');
                return false;
            }
        } catch (error) {
            console.error('Email verification error:', error);
            utils.showNotification('فشل الاتصال بالخادم', 'error');
            return false;
        } finally {
            utils.toggleLoader(false);
        }
    }

    /**
     * إرسال رمز تحقق جديد
     */
    async resendVerification() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                utils.showNotification('تم إرسال رمز التحقق', 'success');
                return true;
            } else {
                utils.showNotification('حدث خطأ', 'error');
                return false;
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            return false;
        }
    }
}

// إنشاء كائن عام للاستخدام
const auth = new Auth();

// تصدير للاستخدام
window.auth = auth;