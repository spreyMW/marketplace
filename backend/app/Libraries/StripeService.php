<?php

namespace App\Libraries;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Create a Payment Intent for the order
     * @param float $amount Amount in cents
     * @param string $currency Currency code (e.g., 'usd')
     * @param array $metadata Additional metadata to attach
     * @return array Payment Intent details or error
     */
    public function createPaymentIntent($amount, $currency = 'usd', $metadata = [])
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int)round($amount * 100), // Convert to cents
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve Payment Intent status
     * @param string $paymentIntentId Stripe Payment Intent ID
     * @return array Payment Intent details
     */
    public function getPaymentIntent($paymentIntentId)
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            return [
                'success' => true,
                'status' => $paymentIntent->status,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'metadata' => $paymentIntent->metadata,
                'charges' => $paymentIntent->charges->data,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Refund a payment
     * @param string $paymentIntentId Stripe Payment Intent ID
     * @param int|null $amountInCents Amount to refund in cents (null = full refund)
     * @return array Refund result
     */
    public function refundPayment($paymentIntentId, $amountInCents = null)
    {
        try {
            $refundParams = [
                'payment_intent' => $paymentIntentId,
            ];

            if ($amountInCents) {
                $refundParams['amount'] = $amountInCents;
            }

            $refund = \Stripe\Refund::create($refundParams);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
                'amount' => $refund->amount,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify webhook signature
     * @param string $payload Raw webhook payload
     * @param string $signature Stripe signature header
     * @return array|bool Array if valid, false if invalid
     */
    public function verifyWebhook($payload, $signature)
    {
        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                env('STRIPE_WEBHOOK_SECRET')
            );

            return $event;
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return false;
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            return false;
        }
    }

    /**
     * Get Stripe publishable key (for frontend)
     * @return string Publishable key
     */
    public function getPublishableKey()
    {
        return env('STRIPE_PUBLIC_KEY');
    }
}
