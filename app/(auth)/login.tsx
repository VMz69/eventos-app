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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Llena todos los campos");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert("Error de Login", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS !== "web") {
      return Alert.alert(
        "Aviso",
        'El login con Google solo funciona en web. Presiona "w" en Expo.'
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
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Hubo un problema con Google");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
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

      <TouchableOpacity style={styles.loginBtn} onPress={handleEmailLogin}>
        <Text style={styles.btnText}>INICIAR SESIÓN</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
        <Text style={styles.btnText}>CONTINUAR CON GOOGLE</Text>
      </TouchableOpacity>

      <Link href={"/(auth)/register"} asChild>
        <Text style={styles.link}>
          ¿No tienes cuenta? Regístrate aquí
        </Text>
      </Link>
    </View>
  );
}
// aqui cambie el stilo para como el de figma
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
  },

  input: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
// ocupe el color aqua para que este conforme a toda la app
  loginBtn: {
    backgroundColor: "#4fb0b7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
  },
// aqui el boton google pero cre que solo fuciona en modo pc
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
