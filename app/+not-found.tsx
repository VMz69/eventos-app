import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "No encontrada" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Esta pantalla no existe.
        </Text>
        <Link href="/" style={{ color: "blue" }}>
          Volver al inicio
        </Link>
      </View>
    </>
  );
}
