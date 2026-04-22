/**
 * Biometric Utility for Orange Finance PWA
 * Uses WebAuthn API to interface with TouchID/FaceID/Windows Hello
 */

const AUTH_CONFIG = {
    rpName: "Orange Finance",
    challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), // Static challenge for local lock
};

/**
 * Check if the device/browser supports biometrics
 */
export const isBiometricSupported = async () => {
    if (!window.PublicKeyCredential) return false;
    
    // Check if platform authenticator (FaceID/Fingerprint) is available
    try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (e) {
        return false;
    }
};

/**
 * Enroll the device for Biometric Access
 * Returns a credential ID to be stored in preferences
 */
export const enrollBiometrics = async (userName) => {
    try {
        const userId = Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(16)));
        
        const options = {
            publicKey: {
                challenge: AUTH_CONFIG.challenge,
                rp: { name: AUTH_CONFIG.rpName, id: window.location.hostname },
                user: {
                    id: userId,
                    name: userName || "user@orangefin.com",
                    displayName: userName || "Orange Finance User",
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "preferred",
                },
                timeout: 60000,
                attestation: "none",
            },
        };

        const credential = await navigator.credentials.create(options);
        if (!credential) throw new Error("Enrollment failed");

        // Convert credential ID to base64 for storage
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        return credentialId;
    } catch (err) {
        console.error("Biometric Enrollment Error:", err);
        throw err;
    }
};

/**
 * Verify identity using Biometrics
 * @param {string} storedCredentialId - The ID received during enrollment
 */
export const verifyBiometrics = async (storedCredentialId) => {
    if (!storedCredentialId) throw new Error("No enrollment found");

    try {
        const rawId = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));
        
        const options = {
            publicKey: {
                challenge: AUTH_CONFIG.challenge,
                allowCredentials: [{
                    id: rawId,
                    type: 'public-key',
                    transports: ['internal'],
                }],
                userVerification: "required",
                timeout: 60000,
            },
        };

        const assertion = await navigator.credentials.get(options);
        return !!assertion;
    } catch (err) {
        console.error("Biometric Verification Error:", err);
        throw err;
    }
};
