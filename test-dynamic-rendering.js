/**
 * Dynamic Field Rendering Test Script
 * Tests token generation and field configuration for all integration models
 */

const INTEGRATION_MODELS = {
  DIRECT_MERCHANT: 'DirectMerchant',
  CLIENT_DIRECT: 'ClientDirect',
  RESIDENT_DIRECT: 'ResidentDirect'
};

// Import the integration models configuration
const { getFieldConfiguration, FIELD_CONFIGURATIONS } = require('./server/config/integrationModels');

console.log('🧪 Starting Dynamic Field Rendering Tests\n');
console.log('═'.repeat(80));

// Test helper function to generate token data
function generateTokenData(integrationModel) {
  const tokenData = {
    realpage_id: '1',
    timestamp: Date.now(),
    application: {
      name: 'Rent Payment Portal',
      guid: '550e8400-e29b-41d4-a716-446655440000',
      integration_model: integrationModel,
      allowed_payment_types: ['Card', 'ACH']
    },
    field_config: {
      card: getFieldConfiguration(integrationModel, 'Card'),
      ach: getFieldConfiguration(integrationModel, 'ACH')
    }
  };

  return tokenData;
}

// Test helper to display results
function displayTestResults(modelName, tokenData) {
  console.log(`\n📋 Testing: ${modelName}`);
  console.log('─'.repeat(80));

  const cardConfig = tokenData.field_config.card;

  console.log(`\n✅ Required Fields (${cardConfig.requiredFields.length}):`);
  cardConfig.requiredFields.forEach((field, index) => {
    console.log(`   ${index + 1}. ${field}`);
  });

  console.log(`\n⚪ Optional Fields (${cardConfig.optionalFields.length}):`);
  if (cardConfig.optionalFields.length > 0) {
    cardConfig.optionalFields.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });
  } else {
    console.log('   (none)');
  }

  console.log(`\n❌ Hidden Fields (${cardConfig.hiddenFields.length}):`);
  if (cardConfig.hiddenFields.length > 0) {
    cardConfig.hiddenFields.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });
  } else {
    console.log('   (none - all fields visible)');
  }

  const totalVisible = cardConfig.requiredFields.length + cardConfig.optionalFields.length;
  console.log(`\n📊 Total Visible Fields: ${totalVisible}`);
  console.log(`📊 Total Hidden Fields: ${cardConfig.hiddenFields.length}`);

  // Encode token to base64
  const tokenString = JSON.stringify(tokenData);
  const base64Token = Buffer.from(tokenString).toString('base64');
  console.log(`\n🔐 Token Generated: ${base64Token.substring(0, 50)}... (${base64Token.length} chars)`);
}

// Verify field counts
function verifyFieldCounts(modelName, tokenData, expectedVisible, expectedHidden) {
  const cardConfig = tokenData.field_config.card;
  const totalVisible = cardConfig.requiredFields.length + cardConfig.optionalFields.length;

  const visiblePass = totalVisible >= expectedVisible[0] && totalVisible <= expectedVisible[1];
  const hiddenPass = cardConfig.hiddenFields.length === expectedHidden;

  console.log(`\n🔍 Verification for ${modelName}:`);
  console.log(`   Visible Fields: ${totalVisible} (expected ${expectedVisible[0]}-${expectedVisible[1]}) ${visiblePass ? '✅' : '❌'}`);
  console.log(`   Hidden Fields: ${cardConfig.hiddenFields.length} (expected ${expectedHidden}) ${hiddenPass ? '✅' : '❌'}`);

  return visiblePass && hiddenPass;
}

// Run tests
try {
  const results = {
    directMerchant: null,
    clientDirect: null,
    residentDirect: null
  };

  // Test 1: DirectMerchant
  console.log('\n\n🎯 TEST 1: DIRECT MERCHANT');
  console.log('═'.repeat(80));
  const dmToken = generateTokenData(INTEGRATION_MODELS.DIRECT_MERCHANT);
  displayTestResults('DirectMerchant', dmToken);
  results.directMerchant = verifyFieldCounts('DirectMerchant', dmToken, [8, 9], 7);

  // Test 2: ClientDirect
  console.log('\n\n🎯 TEST 2: CLIENT DIRECT');
  console.log('═'.repeat(80));
  const cdToken = generateTokenData(INTEGRATION_MODELS.CLIENT_DIRECT);
  displayTestResults('ClientDirect', cdToken);
  results.clientDirect = verifyFieldCounts('ClientDirect', cdToken, [15, 16], 2);

  // Test 3: ResidentDirect
  console.log('\n\n🎯 TEST 3: RESIDENT DIRECT');
  console.log('═'.repeat(80));
  const rdToken = generateTokenData(INTEGRATION_MODELS.RESIDENT_DIRECT);
  displayTestResults('ResidentDirect', rdToken);
  results.residentDirect = verifyFieldCounts('ResidentDirect', rdToken, [18, 18], 0);

  // Final Summary
  console.log('\n\n🏆 TEST SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\n   DirectMerchant:  ${results.directMerchant ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   ClientDirect:    ${results.clientDirect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   ResidentDirect:  ${results.residentDirect ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.directMerchant && results.clientDirect && results.residentDirect;

  if (allPassed) {
    console.log('\n   🎉 ALL TESTS PASSED! 🎉');
    console.log('\n   ✅ Token generation is working correctly');
    console.log('   ✅ Field configurations are accurate');
    console.log('   ✅ Dynamic field rendering is ready to use');
  } else {
    console.log('\n   ⚠️ SOME TESTS FAILED');
    console.log('   Please review the results above');
  }

  console.log('\n' + '═'.repeat(80));

  // Field comparison table
  console.log('\n\n📊 FIELD COMPARISON TABLE');
  console.log('═'.repeat(80));
  console.log('\n| Field Name                | DirectMerchant | ClientDirect | ResidentDirect |');
  console.log('|---------------------------|----------------|--------------|----------------|');

  const allFields = [
    'cardNumber',
    'cardHolderName / nameOnCard',
    'expiryDate',
    'cvv',
    'firstName',
    'lastName',
    'email',
    'phone',
    'dob',
    'govtId',
    'ssn',
    'billingAddress',
    'billingAddressLine1',
    'billingAddressLine2',
    'city',
    'state',
    'country',
    'zip',
    'payorAccountNickName'
  ];

  const fieldMapping = {
    'DirectMerchant': FIELD_CONFIGURATIONS[INTEGRATION_MODELS.DIRECT_MERCHANT],
    'ClientDirect': FIELD_CONFIGURATIONS[INTEGRATION_MODELS.CLIENT_DIRECT],
    'ResidentDirect': FIELD_CONFIGURATIONS[INTEGRATION_MODELS.RESIDENT_DIRECT]
  };

  function isFieldVisible(config, fieldName) {
    const allRequired = [...(config.card.required || []), ...(config.ach.required || [])];
    const allOptional = [...(config.card.optional || []), ...(config.ach.optional || [])];
    const hidden = config.hiddenFields || [];

    // Check for field name variations
    const fieldNameLower = fieldName.toLowerCase().replace(/\s/g, '');

    if (hidden.some(h => h.toLowerCase() === fieldNameLower)) return '❌';
    if (allRequired.some(r => r.toLowerCase().includes(fieldNameLower.split('/')[0]))) return '✅';
    if (allOptional.some(o => o.toLowerCase().includes(fieldNameLower.split('/')[0]))) return '⚠️';

    return '❔';
  }

  allFields.forEach(field => {
    const dm = isFieldVisible(fieldMapping.DirectMerchant, field);
    const cd = isFieldVisible(fieldMapping.ClientDirect, field);
    const rd = isFieldVisible(fieldMapping.ResidentDirect, field);

    const paddedField = field.padEnd(25);
    const paddedDm = dm.padEnd(14);
    const paddedCd = cd.padEnd(12);

    console.log(`| ${paddedField} | ${paddedDm} | ${paddedCd} | ${rd}            |`);
  });

  console.log('\nLegend: ✅ = Visible | ❌ = Hidden | ⚠️ = Optional | ❔ = Unknown');

  console.log('\n' + '═'.repeat(80));
  console.log('✨ Test completed successfully!\n');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
