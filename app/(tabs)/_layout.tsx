import { Tabs } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, View } from "react-native";
import { auth } from "../../src/services/firebaseConfig";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        // Inyectamos el botón en la esquina superior derecha de todas las pestañas
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <Button
              title="Salir"
              color="#d9534f"
              onPress={() => signOut(auth)}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="create" options={{ title: "Crear Evento" }} />
      <Tabs.Screen name="stats" options={{ title: "Historial" }} />
    </Tabs>
  );
}
