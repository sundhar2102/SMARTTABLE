import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { validateEmail, validatePhone, validatePassword } from '../utils/authValidation';
import { initiateOAuth } from '../services/oauthService';
import { apiService } from '../services/api';

/**
 * Reusable React hook for handling Diner and Owner registration workflows
 * @param {string} role 'customer' | 'owner'
 * @param {string} redirectPath Default redirect path after successful registration
 */
export const useAuthForm = ({ role = 'customer', redirectPath = '/' } = {}) => {
  const navigate = useNavigate();
  const { registerUser, verifyOtpUser, loginWithOAuth, triggerToast } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'apple' | null
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validates standard registration fields
   */
  const validateCommon = (fields) => {
    const errs = {};
    if (!fields.name || !fields.name.trim()) {
      errs.name = 'Full name is required.';
    }

    const emailErr = validateEmail(fields.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(fields.password);
    if (passErr) errs.password = passErr;

    const phoneErr = validatePhone(fields.phone, role === 'owner');
    if (phoneErr) errs.phone = phoneErr;

    if (role === 'owner') {
      if (!fields.restaurantName || !fields.restaurantName.trim()) {
        errs.restaurantName = 'Business or restaurant name is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /**
   * Submits user or owner registration
   */
  const handleRegister = async (formData, extraPayload = {}) => {
    setErrors({});
    if (!validateCommon(formData)) {
      return { success: false, error: 'Please fix validation errors.' };
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone?.trim() || '',
        role,
        ...extraPayload
      };

      // Register & Authenticate in Context
      const result = await registerUser(payload, role);

      setIsLoading(false);
      if (result.success) {
        if (result.requireOtp) {
          return { success: true, requireOtp: true, email: result.email };
        }
        navigate(redirectPath);
        return { success: true };
      } else {
        setErrors({ form: result.error || 'Registration failed.' });
        return { success: false, error: result.error };
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ form: err.message || 'An unexpected error occurred during registration.' });
      return { success: false, error: err.message };
    }
  };

  /**
   * Verifies OTP and completes registration
   */
  const handleVerifyOtp = async (email, otp) => {
    setErrors({});
    if (!otp || otp.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit code.' };
    }

    setIsLoading(true);
    try {
      const result = await verifyOtpUser(email, otp, role);
      setIsLoading(false);

      if (result.success) {
        navigate(redirectPath);
        return { success: true };
      } else {
        setErrors({ form: result.error || 'Verification failed.' });
        return { success: false, error: result.error };
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ form: err.message || 'An unexpected error occurred during verification.' });
      return { success: false, error: err.message };
    }
  };

  /**
   * Triggers OAuth registration (Google / Apple) for the selected role.
   * Dev mode: resolves immediately with a synthetic profile.
   * Prod mode: navigates away to provider; AppContext picks up the result on return.
   */
  const handleOAuthRegister = (provider) => {
    setOauthLoading(provider);
    setErrors({});

    initiateOAuth(provider, {
      role,
      forceAccountSelect: true,
      returnPath: redirectPath
    })
      .then((result) => {
        // Only reached in dev mode (prod navigates away)
        if (result && result.success && result.userProfile) {
          loginWithOAuth(result.provider, result.userProfile, result.role || role);
          navigate(redirectPath);
        }
        setOauthLoading(null);
      })
      .catch((err) => {
        setOauthLoading(null);
        setErrors({ form: err.message });
        if (triggerToast) triggerToast('OAuth Error', err.message, 'alert');
      });
  };

  return {
    isLoading,
    oauthLoading,
    errors,
    setErrors,
    showPassword,
    setShowPassword,
    handleRegister,
    handleVerifyOtp,
    handleOAuthRegister,
    validateCommon
  };
};
