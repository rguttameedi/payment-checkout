import React, { useEffect } from 'react';

/**
 * Diagnostic Component - Add this temporarily to check auth state
 */
function DiagnosticCheck() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    console.log('='.repeat(60));
    console.log('🔍 DIAGNOSTIC CHECK');
    console.log('='.repeat(60));
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    }
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('Current URL:', window.location.href);
    console.log('='.repeat(60));
  }, []);

  return null; // This component doesn't render anything
}

export default DiagnosticCheck;
