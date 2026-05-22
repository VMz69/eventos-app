import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";
import { formatFecha, formatHora } from "../../src/utils/formatters";

export default function IndexScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const router = useRouter();
  const { user } = useAuth();

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

  const renderItem = ({ item }: { item: Evento }) => {
    const isMyEvent = user?.uid === item.creadorId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        {isMyEvent && <Text style={styles.cardBadge}>tu evento</Text>}

        <Text style={styles.cardTitulo}>{item.titulo}</Text>

        <Text style={styles.cardMeta}>
          {formatFecha(item.fecha)} • {formatHora(item.hora)}
        </Text>

        <Text style={styles.cardUbicacion}>📍 {item.ubicacion}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.encabezado}>Eventos Próximos</Text>

      {eventos.length === 0 ? (
        <Text style={styles.vacio}>No hay eventos. ¡Crea el primero!</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },
  encabezado: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
    color: "#4a90e2",
  },
  vacio: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
  },
  card: {
    position: "relative",
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4a90e2",
    color: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardMeta: {
    color: "#4a90e2",
    marginTop: 5,
    fontSize: 14,
  },
  cardUbicacion: {
    color: "#666",
    marginTop: 3,
    fontSize: 13,
  },
});
