import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../src/services/firebaseConfig";
import { esEmailValido } from "../../src/utils/formatters";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (!esEmailValido(email)) {
      nuevosErrores.email =
        "Ingresa un correo válido (ej: usuario@correo.com).";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      nuevosErrores.password =
        "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleRegister = async () => {
    if (!validar()) return;
    if (registrando) return;

    setRegistrando(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
      // _layout.tsx redirigirá automáticamente al feed
    } catch (error: any) {
      const mensajes: Record<string, string> = {
        "auth/email-already-in-use": "Este correo ya está registrado.",
        "auth/invalid-email": "El formato del correo no es válido.",
        "auth/weak-password": "La contraseña es demasiado débil.",
      };
      Alert.alert("Error de Registro", mensajes[error.code] ?? error.message);
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Crear Cuenta</Text>

      <Text style={styles.label}>Nombre Completo *</Text>
      <TextInput
        value={nombre}
        onChangeText={(t) => {
          setNombre(t);
          if (errores.nombre) setErrores((e) => ({ ...e, nombre: "" }));
        }}
        autoCapitalize="words"
        style={[styles.input, errores.nombre ? styles.inputError : null]}
        placeholder="Ej: Juan Pérez"
      />
      {errores.nombre ? (
        <Text style={styles.errorText}>{errores.nombre}</Text>
      ) : null}

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

      <Text style={styles.label}>Contraseña * (mín. 6 caracteres)</Text>
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
        style={[styles.registerBtn, registrando && { opacity: 0.8 }]}
        onPress={handleRegister}
        disabled={registrando}
      >
        <Text style={styles.btnText}>
          {registrando ? "CREANDO CUENTA..." : "CREAR CUENTA"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <Text style={styles.link}>¿Ya tienes cuenta? Iniciar sesión</Text>
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
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#eeeeee",
    padding: 14,
    borderRadius: 10,
    marginBottom: 5, // Reducido para dar espacio al texto de error
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#d9534f",
  },
  errorText: {
    color: "#d9534f",
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  registerBtn: {
    backgroundColor: "#4fb0b7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
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
    fontSize: 14,
    marginTop: 10,
  },
});
