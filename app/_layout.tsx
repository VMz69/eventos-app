import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthProvider";

const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f7fa",
        }}
      >
        {/* LOGO */}
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 100,
            height: 100,
            marginBottom: 20,
            resizeMode: "contain",
          }}
        />

        <ActivityIndicator size="large" color="#4a90e2" />

        <Text
          style={{
            marginTop: 10,
            color: "#666",
            fontSize: 14,
          }}
        >
          Cargando aplicación...
        </Text>
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}