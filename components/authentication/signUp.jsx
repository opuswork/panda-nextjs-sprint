'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './signUp.module.css'; 

function SignUp() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    password: '',
    passwordConfirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const togglePasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    let newErrors = {};
    let isValid = true;

    if (!formData.firstName) { newErrors.firstName = '성을 입력해주세요.'; isValid = false; }
    if (!formData.lastName) { newErrors.lastName = '이름을 입력해주세요.'; isValid = false; }
    if (!formData.email) { newErrors.email = '이메일을 입력해주세요.'; isValid = false; }
    if (!formData.nickname) { newErrors.nickname = '닉네임을 입력해주세요.'; isValid = false; }
    if (!formData.password) { newErrors.password = '비밀번호를 입력해주세요.'; isValid = false; }
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setLoading(true);
      try {
        console.log('Sending data to API:', formData);

        // ✅ 1. Hash the password here!
        const hashedPassword = await hashPasswordSHA1(formData.password);

        console.log('Sending data to API:', { ...formData, password: hashedPassword });

        // ✅ 2. CALL THE API (Using the /api/Users route you created)
        const res = await fetch('/api/users', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Send exactly what your backend needs
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            nickname: formData.nickname,
            password: hashedPassword
          }),
        });

        if (!res.ok) {
          throw new Error('회원가입에 실패했습니다.');
        }

        const data = await res.json();
        console.log('Registration success:', data);
        
        // Success Alert & Redirect
        alert('회원가입이 완료되었습니다!');
        router.push('/auth'); 

      } catch (error) {
        console.error("SignUp Error:", error);
        alert(error.message || '회원가입 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
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
        
        {/* Name Row */}
        <div className={styles.nameRow}>
          <div className={styles.halfInput}>
            <label htmlFor="firstName" className={styles.label}>성</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="성"
              value={formData.firstName}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.firstName ? styles.inputError : ''}`}
            />
            <div className={`${styles.errorMessage} ${errors.firstName ? styles.showError : ''}`}>
              {errors.firstName}
            </div>
          </div>

          <div className={styles.halfInput}>
            <label htmlFor="lastName" className={styles.label}>이름</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="이름"
              value={formData.lastName}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.lastName ? styles.inputError : ''}`}
            />
            <div className={`${styles.errorMessage} ${errors.lastName ? styles.showError : ''}`}>
              {errors.lastName}
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={styles.label}>이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
          />
          <div className={`${styles.errorMessage} ${errors.email ? styles.showError : ''}`}>
            {errors.email}
          </div>
        </div>

        {/* Nickname */}
        <div>
          <label htmlFor="nickname" className={styles.label}>닉네임</label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={formData.nickname}
            onChange={handleChange}
            className={`${styles.inputField} ${errors.nickname ? styles.inputError : ''}`}
          />
          <div className={`${styles.errorMessage} ${errors.nickname ? styles.showError : ''}`}>
            {errors.nickname}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={styles.label}>비밀번호</label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.password ? styles.inputError : ''}`}
            />
            <Image
              src={showPassword ? "/assets/icons/eye-open.svg" : "/assets/icons/eye-closed.svg"}
              alt="toggle"
              width={24}
              height={24}
              className={styles.eyeIcon}
              onClick={togglePassword}
            />
          </div>
          <div className={`${styles.errorMessage} ${errors.password ? styles.showError : ''}`}>
            {errors.password}
          </div>
        </div>

        {/* Password Confirm */}
        <div>
          <label htmlFor="passwordConfirmation" className={styles.label}>비밀번호 확인</label>
          <div className={styles.inputWrapper}>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.passwordConfirmation ? styles.inputError : ''}`}
            />
            <Image
              src={showPasswordConfirm ? "/assets/icons/eye-open.svg" : "/assets/icons/eye-closed.svg"}
              alt="toggle"
              width={24}
              height={24}
              className={styles.eyeIcon}
              onClick={togglePasswordConfirm}
            />
          </div>
          <div className={`${styles.errorMessage} ${errors.passwordConfirmation ? styles.showError : ''}`}>
            {errors.passwordConfirmation}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
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
        이미 회원이신가요? <Link href="/auth">로그인</Link>
      </div>
    </main>
  );
}

// 👇 PASTE THIS FUNCTION HERE (Outside the component)
async function hashPasswordSHA1(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default SignUp;