import { Link } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../src/services/firebaseConfig";
import { esEmailValido } from "../../src/utils/formatters";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (!esEmailValido(email)) {
      nuevosErrores.email =
        "Ingresa un correo válido (ej: usuario@correo.com).";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validar()) return;
    if (iniciando) return;

    setIniciando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      const mensajes: Record<string, string> = {
        "auth/user-not-found": "No existe una cuenta con este correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
        "auth/invalid-email": "El formato del correo no es válido.",
      };
      Alert.alert("Error de Login", mensajes[error.code] ?? error.message);
    } finally {
      setIniciando(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS !== "web") {
      return Alert.alert(
        "Aviso",
        'El login con Google está configurado para pruebas en Web. Presiona "w" en la terminal de Expo para probarlo.',
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", user.uid), {
          nombre: user.displayName || "Usuario de Google",
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema con el login de Google.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ComunidadApp</Text>

      <Text style={styles.label}>Correo *</Text>
      <TextInput
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errores.email) setErrores((e) => ({ ...e, email: "" }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, errores.email ? styles.inputError : null]}
        placeholder="usuario@correo.com"
      />
      {errores.email ? (
        <Text style={styles.errorText}>{errores.email}</Text>
      ) : null}

      <Text style={styles.label}>Contraseña *</Text>
      <TextInput
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errores.password) setErrores((e) => ({ ...e, password: "" }));
        }}
        secureTextEntry
        style={[styles.input, errores.password ? styles.inputError : null]}
        placeholder="••••••••"
      />
      {errores.password ? (
        <Text style={styles.errorText}>{errores.password}</Text>
      ) : null}

      <View style={{ marginTop: 10 }}>
        <Button
          title={iniciando ? "Ingresando..." : "Iniciar Sesión"}
          onPress={handleEmailLogin}
          disabled={iniciando}
        />
      </View>

      <View style={{ marginVertical: 20 }}>
        <Button
          title="G  Continuar con Google"
          color="#db4437"
          onPress={handleGoogleLogin}
        />
      </View>

      <Link href={"/(auth)/register" as any} style={styles.link}>
        ¿No tienes cuenta? Regístrate aquí
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 4,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#d9534f" },
  errorText: { color: "#d9534f", fontSize: 12, marginBottom: 10 },
  link: { textAlign: "center", color: "blue", marginTop: 15 },
});
