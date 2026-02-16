import { useEffect } from 'react';

/**
 * Dynamic Field Controller
 *
 * This hook applies CSS rules to hide/show fields in the Shared Wallet UI
 * based on the integration model metadata in the user scoped token.
 *
 * @param {Object} tokens - Wallet tokens containing field configuration
 * @param {Object} walletRef - Reference to the wallet-dropdown web component
 */
export function useDynamicFieldControl(tokens, walletRef) {
  useEffect(() => {
    if (!tokens || !walletRef.current) return;

    // DEBUG: Log the raw token
    console.log('🔍 DEBUG: Raw userScopedAccessToken:', tokens.userScopedAccessToken?.substring(0, 100) + '...');

    // Decode the user scoped token to get field configuration
    const tokenData = decodeUserScopedToken(tokens.userScopedAccessToken);

    // DEBUG: Log what we decoded
    console.log('🔍 DEBUG: Decoded token data:', tokenData);
    console.log('🔍 DEBUG: Has field_config?', !!tokenData?.field_config);
    console.log('🔍 DEBUG: field_config value:', tokenData?.field_config);

    if (!tokenData || !tokenData.field_config) {
      console.log('⚠️ No field configuration found in token, using default view');
      return;
    }

    console.log('🎨 Applying dynamic field configuration:', {
      integrationModel: tokenData.application?.integration_model,
      allowedPaymentTypes: tokenData.application?.allowed_payment_types
    });

    // Wait for shadow root to be available
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 2 seconds
    const checkInterval = 100; // Check every 100ms

    const waitForShadowRoot = setInterval(() => {
      attempts++;
      console.log(`🔍 Attempt ${attempts}: Checking for shadow root...`);

      if (walletRef.current?.shadowRoot) {
        console.log('✅ Shadow root is now available!');
        clearInterval(waitForShadowRoot);

        // Apply rules immediately
        applyFieldVisibilityRules(walletRef.current, tokenData);

        // Set up mutation observer to handle dynamic form changes
        const observer = new MutationObserver(() => {
          applyFieldVisibilityRules(walletRef.current, tokenData);
        });

        observer.observe(walletRef.current.shadowRoot, {
          childList: true,
          subtree: true
        });

        // Clean up on unmount
        return () => {
          observer.disconnect();
        };
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Shadow root not available after maximum attempts');
        clearInterval(waitForShadowRoot);
      }
    }, checkInterval);

    // Clean up interval on unmount
    return () => {
      clearInterval(waitForShadowRoot);
    };
  }, [tokens, walletRef]);
}

/**
 * Decode base64 user scoped token
 */
function decodeUserScopedToken(token) {
  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Error decoding user scoped token:', error);
    return null;
  }
}

/**
 * Apply field visibility rules based on token configuration
 */
function applyFieldVisibilityRules(walletElement, tokenData) {
  console.log('🔍 DEBUG: applyFieldVisibilityRules called');

  const shadowRoot = walletElement.shadowRoot;
  if (!shadowRoot) {
    console.warn('⚠️ Shadow root not accessible, cannot apply field rules');
    return;
  }

  console.log('🔍 DEBUG: Shadow root found:', shadowRoot);

  const { field_config, application } = tokenData;
  console.log('🔍 DEBUG: field_config:', field_config);
  console.log('🔍 DEBUG: application:', application);

  // Determine which payment type we're currently viewing
  const currentPaymentType = getCurrentPaymentType(shadowRoot);
  console.log('🔍 DEBUG: currentPaymentType:', currentPaymentType);

  if (!currentPaymentType) {
    console.log('ℹ️ No active payment form detected');
    return;
  }

  // Get configuration for current payment type
  const config = currentPaymentType.toLowerCase() === 'card'
    ? field_config.card
    : field_config.ach;

  console.log(`📋 Applying field rules for ${currentPaymentType}:`, {
    hidden: config.hiddenFields?.length || 0,
    required: config.requiredFields?.length || 0
  });

  // DEBUG: Inspect all form inputs to see actual field names
  console.log('🔍 DEBUG: Inspecting all form inputs in shadow DOM...');
  const allInputs = shadowRoot.querySelectorAll('input, select, textarea');
  console.log('🔍 DEBUG: Total inputs found:', allInputs.length);
  allInputs.forEach((input, index) => {
    console.log(`🔍 Input #${index + 1}:`, {
      tagName: input.tagName,
      name: input.name || '(no name)',
      id: input.id || '(no id)',
      className: input.className || '(no class)',
      placeholder: input.placeholder || '(no placeholder)',
      type: input.type || '(no type)'
    });
  });

  // Hide fields based on configuration
  hideFields(shadowRoot, config.hiddenFields || []);

  // Mark required fields
  markRequiredFields(shadowRoot, config.requiredFields || []);

  // Filter payment type options
  filterPaymentTypes(shadowRoot, application.allowed_payment_types || ['Card', 'ACH']);

  // Add visual indicator for integration model
  addIntegrationModelBadge(shadowRoot, application);
}

/**
 * Determine current payment type being shown
 */
function getCurrentPaymentType(shadowRoot) {
  // Look for active tab or form title
  const cardForm = shadowRoot.querySelector('[class*="card"], [data-type="card"], [id*="card"]');
  const achForm = shadowRoot.querySelector('[class*="bank"], [class*="ach"], [data-type="ach"]');

  if (cardForm && isVisible(cardForm)) {
    return 'card';
  } else if (achForm && isVisible(achForm)) {
    return 'ach';
  }

  return null;
}

/**
 * Check if element is visible
 */
function isVisible(element) {
  return element.offsetParent !== null &&
         getComputedStyle(element).display !== 'none' &&
         getComputedStyle(element).visibility !== 'hidden';
}

/**
 * Hide specified fields in the form
 */
function hideFields(shadowRoot, hiddenFields) {
  // Map backend field names to actual field IDs in the Shared Wallet UI
  const fieldIdMap = {
    'firstName': 'first-name',
    'lastName': 'last-name',
    'email': 'email',
    'phone': 'phone',
    'dob': 'dob',
    'govtId': 'govt-id',
    'ssn': 'ssn',
    'country': 'country',
    'billingAddress': 'address1',
    'billingAddressLine2': 'address2',
    'city': 'city',
    'state': 'state',
    'zip': 'zip',
    'payorAccountNickName': 'Nick-name'
  };

  console.log('🔍 DEBUG: Attempting to hide fields:', hiddenFields);

  hiddenFields.forEach(fieldName => {
    // Get the actual field ID from the map
    const actualFieldId = fieldIdMap[fieldName] || fieldName;
    console.log(`🔍 Mapping "${fieldName}" → "${actualFieldId}"`);

    // Try to find the field by ID
    const element = shadowRoot.querySelector(`#${actualFieldId}`);

    if (element) {
      // Find the parent container (usually 2-3 levels up)
      let container = element.parentElement;

      // Try to find the outermost container that wraps label + input
      while (container && container.parentElement && container.parentElement.tagName !== 'FORM') {
        // If this container has siblings that look like labels, this is probably the right level
        const hasLabel = container.querySelector('label') || container.previousElementSibling?.tagName === 'LABEL';
        if (hasLabel) {
          break;
        }
        container = container.parentElement;
      }

      // Hide the container with !important to override any other styles
      if (container && container !== element) {
        container.style.setProperty('display', 'none', 'important');
        console.log(`✅ Hidden field: ${fieldName} (ID: ${actualFieldId}) - hid container`, container);
      } else {
        // Fallback: hide the element and its parent
        element.style.setProperty('display', 'none', 'important');
        if (element.parentElement) {
          element.parentElement.style.setProperty('display', 'none', 'important');
        }
        console.log(`✅ Hidden field: ${fieldName} (ID: ${actualFieldId}) - hid element and parent`);
      }
    } else {
      console.warn(`⚠️ Could not find field: ${fieldName} (tried ID: ${actualFieldId})`);
    }
  });
}

/**
 * Mark fields as required
 */
function markRequiredFields(shadowRoot, requiredFields) {
  requiredFields.forEach(fieldName => {
    const selectors = [
      `[name="${fieldName}"]`,
      `[id="${fieldName}"]`,
      `[data-field="${fieldName}"]`
    ];

    for (const selector of selectors) {
      const elements = shadowRoot.querySelectorAll(selector);

      elements.forEach(element => {
        element.setAttribute('required', 'true');
        element.setAttribute('aria-required', 'true');

        // Add visual indicator (asterisk)
        const label = shadowRoot.querySelector(`label[for="${element.id}"]`);
        if (label && !label.querySelector('.required-indicator')) {
          const asterisk = document.createElement('span');
          asterisk.className = 'required-indicator';
          asterisk.textContent = ' *';
          asterisk.style.color = 'red';
          label.appendChild(asterisk);
        }
      });
    }
  });
}

/**
 * Filter payment type options (hide disabled payment types)
 */
function filterPaymentTypes(shadowRoot, allowedTypes) {
  const allPaymentTypes = ['Card', 'ACH', 'IRD', 'Cash', 'ApplePay'];
  const disabledTypes = allPaymentTypes.filter(type => !allowedTypes.includes(type));

  // Hide tabs or buttons for disabled payment types
  disabledTypes.forEach(type => {
    const selectors = [
      `[data-payment-type="${type}"]`,
      `[data-type="${type.toLowerCase()}"]`,
      `button:contains("${type}")`,
      `[class*="${type.toLowerCase()}"]`
    ];

    selectors.forEach(selector => {
      try {
        const elements = shadowRoot.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          console.log(`✅ Disabled payment type: ${type}`);
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
  });
}

/**
 * Add visual badge showing integration model
 */
function addIntegrationModelBadge(shadowRoot, application) {
  // Check if badge already exists
  if (shadowRoot.querySelector('.integration-model-badge')) {
    return;
  }

  // Find the form header or container
  const formContainer = shadowRoot.querySelector('form, [class*="modal"], [class*="container"]');

  if (formContainer) {
    const badge = document.createElement('div');
    badge.className = 'integration-model-badge';
    badge.innerHTML = `
      <div style="
        background: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 12px;
        display: inline-block;
      ">
        <strong>${application.name}</strong> - ${application.integration_model}
      </div>
    `;

    formContainer.insertBefore(badge, formContainer.firstChild);
    console.log(`✅ Added integration model badge: ${application.integration_model}`);
  }
}

/**
 * Helper to get field configuration from token
 */
export function getFieldConfigFromToken(tokens) {
  if (!tokens || !tokens.userScopedAccessToken) {
    return null;
  }

  const tokenData = decodeUserScopedToken(tokens.userScopedAccessToken);
  return tokenData?.field_config || null;
}

/**
 * Helper to get application info from token
 */
export function getApplicationInfoFromToken(tokens) {
  if (!tokens || !tokens.userScopedAccessToken) {
    return null;
  }

  const tokenData = decodeUserScopedToken(tokens.userScopedAccessToken);
  return tokenData?.application || null;
}

export default useDynamicFieldControl;
