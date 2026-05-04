import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Opens a Stripe Checkout URL.
 *
 * - Mobile (Android/iOS): Uses @capacitor/browser in-app browser.
 *   Stripe redirects to sdfitness:// which Android intercepts → app re-opens.
 * - Web: Standard window.location.href redirect.
 */
export async function openStripeCheckout(checkoutUrl: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
        await Browser.open({
            url: checkoutUrl,
            presentationStyle: 'popover',
            toolbarColor: '#0f172a',
        });
    } else {
        window.location.href = checkoutUrl;
    }
}
