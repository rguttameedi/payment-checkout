const crypto = require('crypto');
const axios = require('axios');

/**
 * Cybersource Payment Service
 * Handles payment tokenization, processing, and transaction management
 */
class PaymentService {
  constructor() {
    this.merchantId = process.env.CYBERSOURCE_MERCHANT_ID;
    this.apiKey = process.env.CYBERSOURCE_API_KEY;
    this.secretKey = process.env.CYBERSOURCE_SECRET_KEY;
    this.apiUrl = process.env.CYBERSOURCE_API_URL || 'https://apitest.cybersource.com';
    this.environment = process.env.CYBERSOURCE_ENVIRONMENT || 'sandbox';
  }

  /**
   * Generate signature for Cybersource API request
   */
  generateSignature(payload, timestamp) {
    const signatureString = `${timestamp}${JSON.stringify(payload)}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('base64');
  }

  /**
   * Make authenticated request to Cybersource API
   */
  async makeRequest(endpoint, method, payload) {
    const timestamp = new Date().getTime().toString();
    const signature = this.generateSignature(payload, timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'v-c-merchant-id': this.merchantId,
      'v-c-date': timestamp,
      'v-c-signature': signature,
      'v-c-api-key': this.apiKey
    };

    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers,
        data: payload
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Cybersource API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Tokenize payment method (card or ACH)
   * This creates a secure token that can be stored and reused
   */
  async tokenizePaymentMethod(paymentData) {
    const { payment_type, card, ach, billing_address } = paymentData;

    const payload = {
      clientReferenceInformation: {
        code: `token_${Date.now()}`
      },
      orderInformation: {
        billTo: {
          firstName: billing_address.first_name,
          lastName: billing_address.last_name,
          address1: billing_address.line1,
          address2: billing_address.line2,
          locality: billing_address.city,
          administrativeArea: billing_address.state,
          postalCode: billing_address.zip_code,
          country: billing_address.country || 'US'
        }
      }
    };

    if (payment_type === 'card') {
      payload.paymentInformation = {
        card: {
          number: card.number,
          expirationMonth: card.expiry_month,
          expirationYear: card.expiry_year,
          securityCode: card.cvv
        }
      };
    } else if (payment_type === 'ach') {
      payload.paymentInformation = {
        bank: {
          account: {
            number: ach.account_number,
            type: ach.account_type // checking or savings
          },
          routingNumber: ach.routing_number
        }
      };
    }

    const result = await this.makeRequest(
      '/tms/v2/tokens',
      'POST',
      payload
    );

    if (result.success) {
      return {
        success: true,
        token: result.data.id,
        card_brand: result.data.paymentInformation?.card?.type,
        last_four: result.data.paymentInformation?.card?.suffix ||
                   result.data.paymentInformation?.bank?.account?.suffix
      };
    }

    return result;
  }

  /**
   * Process a one-time payment
   */
  async processPayment(paymentRequest) {
    const {
      amount,
      currency = 'USD',
      payment_token,
      customer_info,
      order_id,
      description
    } = paymentRequest;

    const payload = {
      clientReferenceInformation: {
        code: order_id || `payment_${Date.now()}`
      },
      processingInformation: {
        capture: true,
        commerceIndicator: 'internet'
      },
      paymentInformation: {
        customer: {
          customerId: payment_token
        }
      },
      orderInformation: {
        amountDetails: {
          totalAmount: amount.toString(),
          currency: currency
        },
        billTo: {
          firstName: customer_info.first_name,
          lastName: customer_info.last_name,
          email: customer_info.email,
          address1: customer_info.address?.line1,
          locality: customer_info.address?.city,
          administrativeArea: customer_info.address?.state,
          postalCode: customer_info.address?.zip_code,
          country: customer_info.address?.country || 'US'
        }
      }
    };

    if (description) {
      payload.orderInformation.lineItems = [{
        productName: description,
        quantity: 1,
        unitPrice: amount.toString()
      }];
    }

    const result = await this.makeRequest(
      '/pts/v2/payments',
      'POST',
      payload
    );

    if (result.success && result.data.status === 'AUTHORIZED') {
      return {
        success: true,
        transaction_id: result.data.id,
        status: 'completed',
        amount: result.data.orderInformation.amountDetails.totalAmount,
        authorization_code: result.data.processorInformation?.approvalCode,
        response_code: result.data.processorInformation?.responseCode
      };
    }

    return {
      success: false,
      status: 'failed',
      error: result.error || { message: 'Payment authorization failed' }
    };
  }

  /**
   * Capture a previously authorized payment
   */
  async capturePayment(authorizationId, amount) {
    const payload = {
      orderInformation: {
        amountDetails: {
          totalAmount: amount.toString(),
          currency: 'USD'
        }
      }
    };

    const result = await this.makeRequest(
      `/pts/v2/payments/${authorizationId}/captures`,
      'POST',
      payload
    );

    if (result.success) {
      return {
        success: true,
        transaction_id: result.data.id,
        status: 'captured'
      };
    }

    return result;
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId, amount, reason) {
    const payload = {
      orderInformation: {
        amountDetails: {
          totalAmount: amount.toString(),
          currency: 'USD'
        }
      },
      clientReferenceInformation: {
        code: `refund_${Date.now()}`,
        comments: reason
      }
    };

    const result = await this.makeRequest(
      `/pts/v2/captures/${transactionId}/refunds`,
      'POST',
      payload
    );

    if (result.success) {
      return {
        success: true,
        refund_id: result.data.id,
        status: 'refunded',
        amount: result.data.orderInformation.amountDetails.totalAmount
      };
    }

    return result;
  }

  /**
   * Void an authorized payment (before capture)
   */
  async voidPayment(authorizationId) {
    const payload = {
      clientReferenceInformation: {
        code: `void_${Date.now()}`
      }
    };

    const result = await this.makeRequest(
      `/pts/v2/payments/${authorizationId}/voids`,
      'POST',
      payload
    );

    if (result.success) {
      return {
        success: true,
        status: 'voided'
      };
    }

    return result;
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(transactionId) {
    const result = await this.makeRequest(
      `/tss/v2/transactions/${transactionId}`,
      'GET',
      {}
    );

    if (result.success) {
      return {
        success: true,
        transaction: result.data
      };
    }

    return result;
  }

  /**
   * Set up recurring/subscription payment
   */
  async createSubscription(subscriptionData) {
    const {
      customer_token,
      amount,
      frequency = 'monthly',
      start_date,
      customer_info
    } = subscriptionData;

    const payload = {
      clientReferenceInformation: {
        code: `subscription_${Date.now()}`
      },
      orderInformation: {
        amountDetails: {
          totalAmount: amount.toString(),
          currency: 'USD'
        }
      },
      paymentInformation: {
        customer: {
          customerId: customer_token
        }
      },
      processingInformation: {
        commerceIndicator: 'recurring'
      },
      recurringPaymentInformation: {
        frequency: frequency,
        startDate: start_date
      }
    };

    const result = await this.makeRequest(
      '/rbs/v1/subscriptions',
      'POST',
      payload
    );

    if (result.success) {
      return {
        success: true,
        subscription_id: result.data.id,
        status: result.data.status
      };
    }

    return result;
  }

  /**
   * Cancel recurring subscription
   */
  async cancelSubscription(subscriptionId) {
    const result = await this.makeRequest(
      `/rbs/v1/subscriptions/${subscriptionId}`,
      'DELETE',
      {}
    );

    return {
      success: result.success,
      status: result.success ? 'cancelled' : 'failed'
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const computedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('base64');

    return computedSignature === signature;
  }
}

module.exports = new PaymentService();
