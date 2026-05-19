import { Tabs, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Button, View } from "react-native";
import { auth } from "../../src/services/firebaseConfig";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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

      <Tabs.Screen
        name="create"
        options={{ title: "Crear Evento" }}
        listeners={{
          tabPress: (e) => {
            // 1. Evitamos que Expo restaure la memoria de la pestaña
            e.preventDefault();
            // 2. Forzamos la navegación a la ruta exacta sin parámetros
            router.push("/(tabs)/create");
          },
        }}
      />

      <Tabs.Screen name="stats" options={{ title: "Historial" }} />
    </Tabs>
  );
}
