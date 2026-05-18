import { signOut } from "firebase/auth";
import { Button, Text, View } from "react-native";
import { auth } from "../../src/services/firebaseConfig";

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Feed de Eventos (Fase 3)
      </Text>
      <Button title="Cerrar Sesión (Prueba)" onPress={() => signOut(auth)} />
    </View>
  );
}
