import { Link } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, Platform, Text, TextInput, View } from "react-native";
import { auth, db } from "../../src/services/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Llena todos los campos");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("Error de Login", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    // Si estás en el teléfono (Expo Go), bloquea el intento
    if (Platform.OS !== "web") {
      return Alert.alert(
        "Aviso",
        'El login con Google está configurado para pruebas en Web. Presiona "w" en la terminal de Expo para probarlo.',
      );
    }

    try {
      // 1. Abrir popup de Google (Solo funciona en Web)
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // 2. Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));

      // 3. Si es la primera vez que entra con Google, le creamos su perfil
      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", user.uid), {
          nombre: user.displayName || "Usuario de Google",
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      // El _layout.tsx detectará el cambio y redirigirá automáticamente al feed
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema con el login de Google");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
        ComunidadApp
      </Text>

      <Text>Correo</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

      <Text>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <Button title="Iniciar Sesión" onPress={handleEmailLogin} />

      <View style={{ marginVertical: 20 }}>
        <Button
          title="G Continuar con Google"
          color="#db4437"
          onPress={handleGoogleLogin}
        />
      </View>

      <Link
        href={"/(auth)/register" as any}
        style={{ textAlign: "center", color: "blue", marginTop: 15 }}
      >
        ¿No tienes cuenta? Regístrate aquí
      </Link>
    </View>
  );
}
