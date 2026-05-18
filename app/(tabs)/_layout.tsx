import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="create" options={{ title: "Crear Evento" }} />
      <Tabs.Screen name="stats" options={{ title: "Historial" }} />
    </Tabs>
  );
}
