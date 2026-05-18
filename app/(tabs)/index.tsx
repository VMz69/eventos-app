import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";

export default function IndexScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Escucha en tiempo real a la colección de eventos
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
        borderWidth: 1,
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
      }}
      onPress={() => router.push(`/event/${item.id}`)} // Redirige a la vista de detalle
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.titulo}</Text>
      <Text style={{ color: "#666", marginTop: 5 }}>
        {item.fecha} • {item.hora} • {item.ubicacion}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 15 }}>
        Eventos Próximos
      </Text>

      {eventos.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No hay eventos. ¡Crea el primero!
        </Text>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
