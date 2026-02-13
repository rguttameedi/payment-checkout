import React, { useEffect, useState, useRef } from 'react';
import { mockWalletAuth } from '../../services/mockWalletAuth';
import './SharedWalletDropdown.css';

/**
 * Shared Wallet Dropdown Component
 *
 * React wrapper for the Shared Wallet UI web component.
 * Handles authentication, initialization, and event management.
 *
 * @param {Object} props - Component props
 * @param {string} props.environment - Environment (production, staging, localdevelopment)
 * @param {string} props.displayMode - Display mode (full, text-only)
 * @param {string} props.paymentType - Filter payment types (all, card, bank)
 * @param {string} props.selectPayment - Pre-selected payment token
 * @param {function} props.onPaymentSelected - Callback when payment is selected
 * @param {function} props.onPaymentAdded - Callback when payment is added
 * @param {function} props.onError - Callback for errors
 */
function SharedWalletDropdown({
  environment = 'localdevelopment',
  displayMode = 'full',
  paymentType = 'all',
  selectPayment = '',
  onPaymentSelected,
  onPaymentAdded,
  onError
}) {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const walletRef = useRef(null);

  /**
   * Load wallet UI script
   */
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="wallet-ui.esm.js"]')) {
      setScriptLoaded(true);
      return;
    }

    // Load the wallet UI web component
    const script = document.createElement('script');
    script.src = '/lib/wallet-ui/wallet-ui.esm.js';
    script.type = 'module';
    script.async = true;

    script.onload = () => {
      console.log('✅ Wallet UI script loaded successfully');
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Wallet UI script');
      setError('Failed to load wallet UI component');
      setScriptLoaded(false);
    };

    document.head.appendChild(script);

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/lib/wallet-ui/wallet-ui.css';
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount (optional - may want to keep for other components)
      // script.remove();
      // link.remove();
    };
  }, []);

  /**
   * Initialize wallet authentication
   */
  useEffect(() => {
    async function initializeAuth() {
      try {
        setLoading(true);
        setError(null);

        console.log('🔐 Initializing Wallet Authentication...');

        // Get or initialize tokens (uses cached if available)
        const authTokens = await mockWalletAuth.getOrInitializeTokens();

        setTokens(authTokens);
        setLoading(false);

        console.log('✅ Wallet authentication initialized');

      } catch (err) {
        console.error('❌ Failed to initialize wallet authentication:', err);
        setError('Failed to authenticate with wallet service');
        setLoading(false);

        if (onError) {
          onError(err);
        }
      }
    }

    if (scriptLoaded) {
      initializeAuth();
    }
  }, [scriptLoaded, onError]);

  /**
   * Setup event listeners for wallet events
   */
  useEffect(() => {
    if (!walletRef.current || !scriptLoaded) return;

    // Payment selected event
    const handlePaymentSelected = (event) => {
      console.log('💳 Payment selected:', event.detail);

      if (onPaymentSelected) {
        onPaymentSelected(event.detail);
      }
    };

    // Card added event
    const handleCardAdded = (event) => {
      console.log('✅ Card added:', event.detail);

      if (onPaymentAdded) {
        onPaymentAdded({
          type: 'card',
          ...event.detail
        });
      }
    };

    // Bank account added event
    const handleBankAdded = (event) => {
      console.log('✅ Bank account added:', event.detail);

      if (onPaymentAdded) {
        onPaymentAdded({
          type: 'bank',
          ...event.detail
        });
      }
    };

    // Error event
    const handleWalletError = (event) => {
      console.error('❌ Wallet error:', event.detail);

      if (onError) {
        onError(event.detail);
      }
    };

    // Add event listeners
    const walletElement = walletRef.current;

    walletElement.addEventListener('selectOption', handlePaymentSelected);
    walletElement.addEventListener('cardAdded', handleCardAdded);
    walletElement.addEventListener('bankAccountAdded', handleBankAdded);

    // Global wallet events
    document.addEventListener('wallet:payment:selected', handlePaymentSelected);
    document.addEventListener('wallet:add-payment:success', handleCardAdded);
    document.addEventListener('wallet:add-bank:success', handleBankAdded);
    document.addEventListener('wallet:api:error', handleWalletError);

    // Cleanup
    return () => {
      walletElement.removeEventListener('selectOption', handlePaymentSelected);
      walletElement.removeEventListener('cardAdded', handleCardAdded);
      walletElement.removeEventListener('bankAccountAdded', handleBankAdded);

      document.removeEventListener('wallet:payment:selected', handlePaymentSelected);
      document.removeEventListener('wallet:add-payment:success', handleCardAdded);
      document.removeEventListener('wallet:add-bank:success', handleBankAdded);
      document.removeEventListener('wallet:api:error', handleWalletError);
    };
  }, [scriptLoaded, onPaymentSelected, onPaymentAdded, onError]);

  // Loading state
  if (loading) {
    return (
      <div className="wallet-loading">
        <div className="wallet-spinner"></div>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="wallet-error">
        <p className="error-message">❌ {error}</p>
        <button
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Not initialized yet
  if (!tokens || !scriptLoaded) {
    return (
      <div className="wallet-loading">
        <div className="wallet-spinner"></div>
        <p>Initializing wallet...</p>
      </div>
    );
  }

  // Render wallet component
  // Try using localdevelopment environment but override the base URL
  // The wallet UI might not support 'custom' environment properly
  const baseUrl = window.location.origin; // http://localhost:3000

  return (
    <div className="shared-wallet-container">
      <wallet-dropdown
        ref={walletRef}
        operations-token={tokens.operationsToken}
        user-scoped-access-token={tokens.userScopedAccessToken}
        environment="localdevelopment"
        baseurl={baseUrl}
        display-mode={displayMode}
        payment-type={paymentType}
        select-payment={selectPayment}
      />
    </div>
  );
}

export default SharedWalletDropdown;
