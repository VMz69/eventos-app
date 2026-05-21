import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";

export default function IndexScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "eventos"), (snapshot) => {
      const eventosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Evento[];

      setEventos(eventosData);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Evento }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#ffffff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
      }}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
        {item.titulo}
      </Text>

      <Text
        style={{
          color: "#4a90e2",
          marginTop: 5,
          fontSize: 14,
        }}
      >
        {item.fecha} • {item.hora}
      </Text>

      <Text
        style={{
          color: "#666",
          marginTop: 3,
          fontSize: 13,
        }}
      >
        📍 {item.ubicacion}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* LOGO */}
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: 90,
          height: 90,
          alignSelf: "center",
          marginBottom: 10,
          resizeMode: "contain",
        }}
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginVertical: 15,
          textAlign: "center",
          color: "#4a90e2",
        }}
      >
        Eventos Próximos
      </Text>

      {eventos.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 30,
            fontSize: 16,
            color: "#888",
          }}
        >
          No hay eventos. ¡Crea el primero!
        </Text>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}