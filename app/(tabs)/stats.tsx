import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Comentario, Evento } from "../../src/types";

export default function StatsScreen() {
  const { user } = useAuth();

  const [eventosAsistidos, setEventosAsistidos] = useState<Evento[]>([]);
  const [promedio, setPromedio] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Obtener Eventos Asistidos
    const qEventos = query(
      collection(db, "eventos"),
      where("asistentes", "array-contains", user.uid),
    );
    const unsubEventos = onSnapshot(qEventos, (snap) => {
      setEventosAsistidos(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Evento),
      );
    });

    // 2. Obtener Promedio de Votos usando Collection Group
    const qComentarios = query(
      collectionGroup(db, "comentarios"),
      where("usuarioId", "==", user.uid),
    );
    const unsubComentarios = onSnapshot(qComentarios, (snap) => {
      if (snap.empty) {
        setPromedio(0);
      } else {
        let total = 0;
        snap.forEach((doc) => {
          total += (doc.data() as Comentario).calificacion;
        });
        setPromedio(total / snap.size);
      }
      setLoading(false);
    });

    return () => {
      unsubEventos();
      unsubComentarios();
    };
  }, [user]);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Mi Actividad
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#e0e0e0",
            padding: 15,
            borderRadius: 8,
            marginRight: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#bb86fc" }}>
            {eventosAsistidos.length}
          </Text>
          <Text style={{ fontSize: 12, textAlign: "center" }}>
            Eventos Asistidos
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#e0e0e0",
            padding: 15,
            borderRadius: 8,
            marginLeft: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#bb86fc" }}>
            {promedio.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 12, textAlign: "center" }}>
            Puntuación que has dado
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Historial de Asistencia
      </Text>
      {eventosAsistidos.length === 0 ? (
        <Text style={{ color: "#666" }}>
          Aún no has asistido a ningún evento.
        </Text>
      ) : (
        eventosAsistidos.map((ev) => (
          <View
            key={ev.id}
            style={{
              padding: 15,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 10,
              opacity: 0.7,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {ev.titulo}
            </Text>
            <Text style={{ color: "#666" }}>
              {ev.fecha} • {ev.ubicacion}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
