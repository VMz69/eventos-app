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

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      return Alert.alert("Error", "Llena todos los campos");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre,
        email,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      Alert.alert("Error de Registro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Crear Cuenta</Text>

      <Text style={styles.label}>Nombre Completo</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <Text style={styles.label}>Correo</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.btnText}>CREAR CUENTA</Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <Text style={styles.link}>
          ¿Ya tienes cuenta? Iniciar sesión
        </Text>
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
  },

  input: {
    backgroundColor: "#eeeeee",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
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
  },
});