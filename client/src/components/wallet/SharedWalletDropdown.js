import React, { useEffect, useState, useRef } from 'react';
import { mockWalletAuth } from '../../services/mockWalletAuth';
import { useDynamicFieldControl, getApplicationInfoFromToken } from './DynamicFieldController';
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
   * Intercept fetch calls to detect successful payment additions
   */
  useEffect(() => {
    if (!scriptLoaded) return;

    // Store original fetch
    const originalFetch = window.fetch;

    // Override fetch to intercept Shared Wallet API calls
    window.fetch = async (...args) => {
      const [url, options] = args;

      try {
        const response = await originalFetch(...args);

        // Check if this is a payment instrument addition API call
        const isCardAddition = url.includes('/SharedWallet/card');
        const isBankAddition = url.includes('/SharedWallet/bankaccount');
        const isSuccess = response.ok && (response.status === 200 || response.status === 201);

        if ((isCardAddition || isBankAddition) && isSuccess && options?.method === 'POST') {
          console.log('✅ Payment instrument added successfully via API');

          // Clone the response to read it
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();

          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'wallet-success-toast';
          successMessage.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; display: flex; align-items: center; gap: 12px; font-family: system-ui, -apple-system, sans-serif;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span style="font-weight: 500;">Payment method added successfully!</span>
            </div>
          `;
          document.body.appendChild(successMessage);

          // Remove after 3 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 3000);

          // Trigger refresh of wallet
          setTimeout(() => {
            if (walletRef.current) {
              console.log('🔄 Refreshing wallet after payment addition...');
              walletRef.current.loadPaymentInstruments?.();

              // Also try to close the modal if it exists
              const shadowRoot = walletRef.current.shadowRoot;
              if (shadowRoot) {
                const closeButton = shadowRoot.querySelector('[class*="close"], [class*="cancel"], button[type="button"]');
                if (closeButton) {
                  console.log('🚪 Closing payment form modal...');
                  closeButton.click();
                }
              }
            }

            // Trigger callback if provided
            if (onPaymentAdded) {
              onPaymentAdded({
                type: isCardAddition ? 'card' : 'bank',
                ...data
              });
            }

            // Dispatch custom event
            const eventName = isCardAddition ? 'cardAdded' : 'bankAccountAdded';
            const customEvent = new CustomEvent(eventName, { detail: data });
            document.dispatchEvent(customEvent);
          }, 500);
        }

        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    // Cleanup: restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [scriptLoaded, onPaymentAdded]);

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

      // Force reload the wallet after card is added
      setTimeout(() => {
        if (walletRef.current) {
          console.log('🔄 Reloading wallet after card addition...');
          walletRef.current.loadPaymentInstruments?.();
        }
      }, 500);
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

      // Force reload the wallet after bank account is added
      setTimeout(() => {
        if (walletRef.current) {
          console.log('🔄 Reloading wallet after bank account addition...');
          walletRef.current.loadPaymentInstruments?.();
        }
      }, 500);
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

  /**
   * Apply dynamic field visibility based on integration model
   */
  useDynamicFieldControl(tokens, walletRef);

  /**
   * Make form fields optional except essential tokenization fields
   * Required: Name on Card, Card Number, Expiry Date, CVV
   * Optional: Everything else (billing address, nickname, etc.)
   */
  useEffect(() => {
    if (!walletRef.current || !scriptLoaded) return;

    const makeFieldsOptional = () => {
      console.log('🔧 Making optional fields non-required...');

      // Try to access shadow DOM
      const walletElement = walletRef.current;
      const shadowRoot = walletElement.shadowRoot;

      if (!shadowRoot) {
        console.log('⚠️ No shadow root found, trying regular DOM...');
        return;
      }

      // Required field names (keep these as required)
      const requiredFields = [
        'cardHolderName',
        'cardNumber',
        'expiryMonth',
        'expiryYear',
        'cvv',
        'accountHolderName',
        'routingNumber',
        'accountNumber'
      ];

      // Find all input, select, and textarea elements
      const allInputs = shadowRoot.querySelectorAll('input, select, textarea');

      console.log(`📝 Found ${allInputs.length} form fields`);

      allInputs.forEach(input => {
        const fieldName = input.name || input.id || '';
        const isRequired = requiredFields.some(req =>
          fieldName.toLowerCase().includes(req.toLowerCase())
        );

        if (!isRequired) {
          // Remove required attribute
          input.removeAttribute('required');

          // Remove aria-required
          input.removeAttribute('aria-required');

          // Hide asterisks by looking for labels
          const label = shadowRoot.querySelector(`label[for="${input.id}"]`);
          if (label) {
            const asterisk = label.querySelector('.required, [class*="asterisk"]');
            if (asterisk) {
              asterisk.style.display = 'none';
            }
          }

          console.log(`✅ Made ${fieldName || 'unnamed field'} optional`);
        }
      });

      // Also remove validation error messages for optional fields
      const errorMessages = shadowRoot.querySelectorAll('[class*="error"], [class*="invalid"]');
      errorMessages.forEach(error => {
        const parentInput = error.closest('.form-group, .field-group')?.querySelector('input, select, textarea');
        if (parentInput) {
          const fieldName = parentInput.name || parentInput.id || '';
          const isRequired = requiredFields.some(req =>
            fieldName.toLowerCase().includes(req.toLowerCase())
          );

          if (!isRequired) {
            error.style.display = 'none';
          }
        }
      });
    };

    // Wait for component to fully render, then modify fields
    const timer = setTimeout(makeFieldsOptional, 1000);

    // Also observe for dynamic changes (modal opening, tab switching)
    const observer = new MutationObserver(() => {
      makeFieldsOptional();
    });

    if (walletRef.current.shadowRoot) {
      observer.observe(walletRef.current.shadowRoot, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [scriptLoaded]);

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
  // In localdevelopment mode, wallet UI expects backend on specific port
  // We provide both baseurl and api-base-url to ensure it works
  const apiBaseUrl = "http://localhost:50155"; // Direct backend URL

  // Debug logging to verify payment type
  console.log('🔍 SharedWalletDropdown - paymentType prop:', paymentType);
  console.log('🔍 SharedWalletDropdown - displayMode:', displayMode);

  return (
    <div className="shared-wallet-container">
      <wallet-dropdown
        ref={walletRef}
        operations-token={tokens.operationsToken}
        user-scoped-access-token={tokens.userScopedAccessToken}
        environment="localdevelopment"
        api-base-url={apiBaseUrl}
        display-mode={displayMode}
        payment-type={paymentType}
        select-payment={selectPayment}
      />
    </div>
  );
}

export default SharedWalletDropdown;
