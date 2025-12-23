'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signIn.module.css'; 

function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // 1. Basic Validation
    let isValid = true;
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      isValid = false;
    }

    if (!isValid) return;

    // 2. Call API
    setLoading(true);
    try {
      // ✅ 1. Hash the password
      const hashedPassword = await hashPasswordSHA1(password);
      
      console.log('Logging in with hashed password...');
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email, 
            password: hashedPassword 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      console.log('Login success:', data);
      
      // ✅ 2. SAVE COOKIE (Stores user info for 1 hour)
      // We convert the user object to a string and save it
      const userValue = JSON.stringify(data.user);
      document.cookie = `user=${encodeURIComponent(userValue)}; path=/; max-age=3600`;

      // ✅ 3. Redirect to Articles Page
      router.push('/articles'); 

    } catch (error) {
      console.error('Login Failed:', error);
      setGeneralError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
        <div className={styles.logoContainer}>
            <Link href="/">
            <Image 
                src="/assets/logos/panda_logo-login.svg" 
                alt="판다마켓" 
                width={153} 
                height={40} 
                loading="eager"
                />
            </Link>
        </div>      
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className={styles.label}>이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력하세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${styles.inputField} ${emailError ? styles.inputError : ''}`}
          />
          <div className={`${styles.errorMessage} ${emailError ? styles.showError : ''}`}>
            {emailError}
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className={styles.label}>비밀번호</label>
          <div className={styles.inputPWD}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.inputField} ${passwordError ? styles.inputError : ''}`}
            />
            <Image
              src={showPassword ? "/assets/icons/eye-open.svg" : "/assets/icons/eye-closed.svg"}
              alt="비밀번호 표시 변경"
              width={24}
              height={24}
              className={styles.faEye}
              onClick={togglePasswordVisibility}
            />
          </div>
          <div className={`${styles.errorMessage} ${passwordError ? styles.showError : ''}`}>
            {passwordError}
          </div>
        </div>

        {/* General Error Message */}
        {generalError && (
            <div style={{ color: '#ef4444', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {generalError}
            </div>
        )}

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className={styles.socialLogin}>
        간편 로그인하기
        <div className={styles.socialLoginButton}>
          <a href="https://www.google.com/" target="_blank">
            <Image src="/assets/icons/google_button.svg" alt="구글 로그인" width={42} height={42} />
          </a>
          <a href="https://www.kakaocorp.com/" target="_blank">
            <Image src="/assets/icons/kakao-button.svg" alt="카카오 로그인" width={42} height={42} />
          </a>
        </div>
      </div>

      <div className={styles.membership}>
        판다마켓이 처음이신가요? <Link href="/signup">회원가입</Link>
      </div>
    </main>
  );
}

// ✅ HELPER FUNCTION (Must be outside the component)
async function hashPasswordSHA1(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default SignIn;