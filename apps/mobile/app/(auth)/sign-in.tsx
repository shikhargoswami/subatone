// apps/mobile/app/(auth)/sign-in.tsx
//
// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: Sign In
// ─────────────────────────────────────────────────────────────────────────────
//
// FUNCTIONAL SPEC
// ───────────────
// Current state: User has no account. They are on the landing page or installed
//   the app from the store.
// What we change: User authenticates via phone OTP (India-first) or Google SSO.
//   Clerk handles the entire OTP flow — we never see raw credentials.
// Behaviour change: After sign-in, syncUser is called, and the user lands on
//   the onboarding screen (new) or dashboard (returning).
//
// UX REQUIREMENTS
// ───────────────
// - Phone number input with +91 prefix default (auto-detected by Clerk)
// - "Continue with Google" as secondary option
// - Loading state while OTP is being sent
// - OTP input with 6 boxes, auto-focus, auto-submit on 6th digit
// - Clear error messages (not generic "something went wrong")
// - Keyboard dismissal on tap outside
// - Accessibility: all inputs labeled, error messages announced

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useSignIn, useOAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { useAuthSync } from '../../src/modules/auth/useAuthSync'
import { Colors } from '../../src/shared/constants/colors'

type Step = 'phone' | 'otp'

export default function SignInScreen() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()
  const { syncUser } = useAuthSync()

  const handleSendOtp = async () => {
    if (!isLoaded || !phone.trim()) return
    setError(null)
    setIsLoading(true)

    try {
      // Normalise phone: ensure it has country code
      const normalised = phone.startsWith('+') ? phone : `+91${phone}`

      await signIn.create({
        strategy: 'phone_code',
        phoneNumber: normalised,
      })

      await signIn.prepareFirstFactor({ strategy: 'phone_code' })
      setStep('otp')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(
        message.includes('too many') ? 'Too many attempts. Please try again in a minute.' : message,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!isLoaded || otp.length !== 6) return
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: otp,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // Sync with Subatone backend — creates profile if new user
        const { isNewUser } = await syncUser()
        router.replace(isNewUser ? '/(auth)/onboarding' : '/(tabs)')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP'
      setError(
        message.includes('incorrect')
          ? 'Incorrect OTP. Please check and try again.'
          : 'OTP expired. Please request a new one.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow()
      if (createdSessionId) {
        await setActiveOAuth!({ session: createdSessionId })
        const { isNewUser } = await syncUser()
        router.replace(isNewUser ? '/(auth)/onboarding' : '/(tabs)')
      }
    } catch {
      Alert.alert('Sign in failed', 'Could not sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo / Brand */}
        <Text style={styles.logo}>subatone</Text>
        <Text style={styles.tagline}>Track. Pay. Earn.</Text>

        {step === 'phone' ? (
          <>
            <Text style={styles.heading}>Enter your phone number</Text>
            <Text style={styles.subheading}>We'll send a one-time password to verify.</Text>

            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="9876543210"
                placeholderTextColor={Colors.textMuted}
                maxLength={10}
                accessibilityLabel="Phone number"
                accessibilityHint="Enter your 10-digit mobile number"
                autoFocus
              />
            </View>

            {error && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, (!phone.trim() || isLoading) && styles.disabled]}
              onPress={handleSendOtp}
              disabled={!phone.trim() || isLoading}
              accessibilityLabel="Send OTP"
              accessibilityState={{ disabled: !phone.trim() || isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              accessibilityLabel="Continue with Google"
            >
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.heading}>Enter the OTP</Text>
            <Text style={styles.subheading}>Sent to +91 {phone}</Text>

            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(v) => {
                setOtp(v)
                if (v.length === 6) handleVerifyOtp()
              }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="------"
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="OTP code"
              autoFocus
            />

            {error && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, (otp.length !== 6 || isLoading) && styles.disabled]}
              onPress={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(null) }}>
              <Text style={styles.link}>Change phone number</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, gap: 16 },
  logo: { fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: -1 },
  tagline: { fontSize: 14, color: Colors.textMuted, marginTop: -8 },
  heading: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 32 },
  subheading: { fontSize: 15, color: Colors.textMuted, marginTop: -8 },
  phoneRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  prefix: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 12,
    justifyContent: 'center',
  },
  prefixText: { color: Colors.text, fontSize: 15 },
  phoneInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 18, letterSpacing: 1,
  },
  otpInput: {
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 18,
    color: Colors.text, fontSize: 28, letterSpacing: 8,
    textAlign: 'center',
  },
  error: { color: Colors.error, fontSize: 13 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 13 },
  googleBtn: {
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  googleBtnText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  link: { color: Colors.primary, fontSize: 14, textAlign: 'center' },
  legal: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 'auto', marginBottom: 16 },
})
