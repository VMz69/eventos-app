import { Ionicons } from "@expo/vector-icons"; // 👈 AÑADIR
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

        // ESTO ES PARA COLOREAR EL ICONO ACTIVO DE AZULITO
        tabBarActiveTintColor: "#4fb0b7",
        tabBarInactiveTintColor: "#999",

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
      {/* icono INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* icono CREAR */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Crear Evento",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/(tabs)/create");
          },
        }}
      />

      {/* icono HISTORIAL */}
      <Tabs.Screen
        name="stats"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}