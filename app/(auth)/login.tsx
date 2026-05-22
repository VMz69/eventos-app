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
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
        'El login con Google solo funciona en web. Presiona "w" en Expo.',
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", user.uid), {
          nombre: user.displayName || "Usuario",
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
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.label}>Correo *</Text>
      <TextInput
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errores.email) setErrores((e) => ({ ...e, email: "" }));
        }}
        style={[styles.input, errores.email ? styles.inputError : null]}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity
        style={[styles.loginBtn, iniciando && { opacity: 0.8 }]}
        onPress={handleEmailLogin}
        disabled={iniciando}
      >
        <Text style={styles.btnText}>
          {iniciando ? "INGRESANDO..." : "INICIAR SESIÓN"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
        <Text style={styles.btnText}>CONTINUAR CON GOOGLE</Text>
      </TouchableOpacity>

      <Link href={"/(auth)/register"} asChild>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dcdcdc",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 30,
    resizeMode: "contain",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent", // Borde transparente por defecto para que no brinque la UI al dar error
  },
  inputError: {
    borderColor: "#d9534f",
  },
  errorText: {
    color: "#d9534f",
    fontSize: 12,
    marginBottom: 15,
  },
  loginBtn: {
    backgroundColor: "#4fb0b7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    marginTop: 10,
  },
  googleBtn: {
    backgroundColor: "#0b263b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#007BFF",
    marginTop: 10,
  },
});
