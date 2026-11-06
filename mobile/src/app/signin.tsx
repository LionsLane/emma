import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, H, Orb, P } from "@/components/ui";
import { configured, supabase } from "@/lib/supabase";
import { T } from "@/lib/theme";

export default function SignIn() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(configured ? null : "This build isn't connected to an EMMA server yet.");

  const send = async () => {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError("We couldn't send a code. Check the address and try again.");
    else setStep("code");
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.replace(/\D/g, ""), type: "email" });
    setBusy(false);
    if (error) setError("That code didn't work. It may have expired.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", padding: 20, gap: 22 }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Orb size={52} />
          <Text style={{ color: T.text, fontSize: 22, fontWeight: "800", letterSpacing: 4 }}>EMMA</Text>
        </View>
        <Card style={{ padding: 20, gap: 14 }}>
          {step === "email" ? (
            <>
              <H>Sign in</H>
              <Text style={{ color: T.muted, fontSize: 12, fontWeight: "600" }} nativeID="emailLabel">Email</Text>
              <TextInput
                accessibilityLabelledBy="emailLabel" accessibilityLabel="Email"
                value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress"
                placeholder="you@business.co.ke" placeholderTextColor={T.faint}
                style={inputStyle}
              />
              <Button label="Email me a code" kind="ai" onPress={send} busy={busy} disabled={!configured} />
            </>
          ) : (
            <>
              <H>Check your email</H>
              <P muted small>We sent a 6-digit code to {email}.</P>
              <TextInput
                accessibilityLabel="6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={8}
                placeholder="123456" placeholderTextColor={T.faint} style={[inputStyle, { fontSize: 20, letterSpacing: 6 }]}
              />
              <Button label="Sign in" kind="ai" onPress={verify} busy={busy} disabled={code.replace(/\D/g, "").length < 6} />
              <Button label="Use a different email" kind="ghost" onPress={() => { setStep("email"); setCode(""); }} />
            </>
          )}
          {error && <Text accessibilityRole="alert" style={{ color: T.risk, fontSize: 13 }}>{error}</Text>}
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputStyle = { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: T.line, backgroundColor: "rgba(8,14,32,0.7)", color: T.text, paddingHorizontal: 14, fontSize: 16 } as const;
