import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.sdfitness.app',
    appName: 'SDFitness',
    webDir: 'dist',
    plugins: {
        // Deep link scheme: sdfitness://dashboard/payment/success?...
        // Android will intercept this URL and route back into the app
    }
};

export default config;
