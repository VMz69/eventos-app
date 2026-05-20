import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";
import { formatFecha, formatHora } from "../../src/utils/formatters";

export default function IndexScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "eventos"), (snapshot) => {
      const eventosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Evento[];

      // Ordenar por fecha ascendente para mostrar los próximos primero
      eventosData.sort((a, b) =>
        `${a.fecha}T${a.hora}` < `${b.fecha}T${b.hora}` ? -1 : 1,
      );

      setEventos(eventosData);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Evento }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Text style={styles.cardTitulo}>{item.titulo}</Text>
      <Text style={styles.cardMeta}>
        📅 {formatFecha(item.fecha)}
        {"  "}🕒 {formatHora(item.hora)}
      </Text>
      <Text style={styles.cardUbicacion}>📍 {item.ubicacion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.encabezado}>Eventos Próximos</Text>

      {eventos.length === 0 ? (
        <Text style={styles.vacio}>No hay eventos. ¡Crea el primero!</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  encabezado: { fontSize: 20, fontWeight: "bold", marginVertical: 15 },
  vacio: { textAlign: "center", marginTop: 20, color: "#888" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  cardTitulo: { fontSize: 17, fontWeight: "bold", marginBottom: 4 },
  cardMeta: { color: "#555", fontSize: 13, marginBottom: 2 },
  cardUbicacion: { color: "#777", fontSize: 13 },
});
