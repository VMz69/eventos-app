import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
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
      <Text style={styles.titulo}>Crear Cuenta</Text>

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

      <View style={{ marginTop: 10 }}>
        <Button
          title={registrando ? "Creando cuenta..." : "Crear Cuenta"}
          onPress={handleRegister}
          disabled={registrando}
        />
      </View>

      <Link href="/(auth)/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
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
  link: { textAlign: "center", color: "blue", marginTop: 20 },
});
