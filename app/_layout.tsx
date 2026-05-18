import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthProvider";

const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Verifica si el usuario está en el grupo de rutas de autenticación
    const inAuthGroup = segments[0] === ("(auth)" as string);

    if (!user && !inAuthGroup) {
      // No hay usuario y trata de entrar a la app -> Al login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Hay usuario y trata de ir al login -> Al inicio (tabs)
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Renderiza la ruta actual
  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
