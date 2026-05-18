import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { auth } from "../../src/services/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Llena todos los campos");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El _layout.tsx detectará el cambio y redirigirá automáticamente
    } catch (error: any) {
      Alert.alert("Error de Login", error.message);
    }
  };

  const handleGoogleLogin = () => {
    // Lo conectaremos en un paso posterior si decides configurar el Auth Session proxy,
    // por ahora es un botón funcional en la UX.
    Alert.alert("Info", "Login con Google en construcción");
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
        href="/(auth)/register"
        style={{ textAlign: "center", color: "blue", marginTop: 15 }}
      >
        ¿No tienes cuenta? Regístrate aquí
      </Link>
    </View>
  );
}
