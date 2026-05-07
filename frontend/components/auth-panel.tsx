"use client";

import { useState, useTransition } from "react";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Chrome, Mail, LockKeyhole, RefreshCcw } from "lucide-react";

import { firebaseEnabled, getFirebaseApp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>(firebaseEnabled ? "Sign in with Firebase Auth" : "Configure Firebase to enable auth.");
  const [isPending, startTransition] = useTransition();

  const auth = getFirebaseApp() ? getAuth(getFirebaseApp()!) : null;

  const signIn = () => {
    if (!auth) {
      setStatus("Firebase is not configured in this environment.");
      return;
    }

    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus("Signed in successfully.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Sign in failed.");
      }
    });
  };

  const googleSignIn = () => {
    if (!auth) {
      setStatus("Firebase is not configured in this environment.");
      return;
    }

    startTransition(async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        setStatus("Google sign-in successful.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Google sign-in failed.");
      }
    });
  };

  const resetPassword = () => {
    if (!auth) {
      setStatus("Firebase is not configured in this environment.");
      return;
    }

    startTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, email);
        setStatus("Password reset email sent.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Reset failed.");
      }
    });
  };

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Authentication</p>
        <h3 className="mt-2 text-lg font-semibold">Firebase Auth flow</h3>
        <p className="mt-2 text-sm text-muted-foreground">Use email/password or Google login. Protected routes can consume the ID token via the backend.</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={signIn} disabled={isPending || !email || !password}>
          <Mail className="mr-2 h-4 w-4" />
          Sign in
        </Button>
        <Button variant="secondary" onClick={googleSignIn} disabled={isPending}>
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" onClick={resetPassword} disabled={isPending || !email}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset password
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{status}</p>
    </Card>
  );
}
