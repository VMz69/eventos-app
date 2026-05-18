import { Link } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { auth, db } from "../../src/services/firebaseConfig";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!nombre || !email || !password)
      return Alert.alert("Error", "Llena todos los campos");

    try {
      // 1. Crear en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Crear el documento en Firestore (Colección: usuarios)
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        email: email,
        createdAt: new Date().toISOString(),
      });

      // El _layout.tsx redirigirá automáticamente al feed
    } catch (error: any) {
      Alert.alert("Error de Registro", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: "center" }}>
        Crear Cuenta
      </Text>

      <Text>Nombre Completo</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

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

      <Button title="Crear Cuenta" onPress={handleRegister} />

      <Link
        href="/(auth)/login"
        style={{ textAlign: "center", color: "blue", marginTop: 20 }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}
